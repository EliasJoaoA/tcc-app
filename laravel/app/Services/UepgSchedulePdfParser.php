<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use RuntimeException;
use Smalot\PdfParser\Parser;

class UepgSchedulePdfParser
{
    private const DAY_NUMBERS = [
        'Segunda' => 1,
        'Terça' => 2,
        'TerÃ§a' => 2,
        'Terca' => 2,
        'Quarta' => 3,
        'Quinta' => 4,
        'Sexta' => 5,
        'Sábado' => 6,
        'SÃ¡bado' => 6,
        'Sabado' => 6,
    ];

    public function parse(string $path): array
    {
        $pdf = (new Parser())->parseFile($path);
        $pages = $pdf->getPages();
        $page = $pages[0] ?? null;

        if (! $page) {
            throw new RuntimeException('O PDF não possui páginas legíveis.');
        }

        $text = implode("\n", array_map(fn ($item) => $item->getText(), $pages));
        if (! str_contains($text, 'Extrato de Matrícula') || ! str_contains($text, 'Horário das Aulas')) {
            throw new RuntimeException('O arquivo não parece ser um Extrato de Matrícula da UEPG.');
        }

        $metadata = $this->extractMetadata($text);
        $disciplines = $this->extractDisciplines($text);
        $slots = [];
        foreach ($pages as $schedulePage) {
            array_push($slots, ...$this->extractSlotsFromCommands($schedulePage->getDataCommands(), $disciplines));
        }

        if ($slots === []) {
            throw new RuntimeException('Nenhuma aula foi encontrada na grade do PDF.');
        }

        return [
            'metadata' => $metadata,
            'events' => $this->mergeConsecutiveSlots($this->addEndTimes($slots)),
        ];
    }

    private function extractMetadata(string $text): array
    {
        preg_match('/Nome:\s*([^\r\n]+)/u', $text, $name);
        preg_match('/Curso:\s*([^\r\n]+)/u', $text, $course);
        preg_match('/R\.A\.:\s*(\d+)/u', $text, $registration);
        preg_match('/Emitido às\s*\d{2}:\d{2}:\d{2}\s*do dia\s*(\d{2}\/\d{2}\/\d{4})/u', $text, $issuedAt);
        preg_match('/(20\d{2})-(1|2)(?:\D|$)/u', $text, $semester);

        $date = isset($issuedAt[1])
            ? CarbonImmutable::createFromFormat('d/m/Y', $issuedAt[1])->format('Y-m-d')
            : now()->toDateString();

        return [
            'student_name' => trim($name[1] ?? ''),
            'course' => trim($course[1] ?? ''),
            'registration' => $registration[1] ?? null,
            'issued_at' => $date,
            'semester' => isset($semester[1], $semester[2]) ? "{$semester[1]}.{$semester[2]}" : null,
        ];
    }

    private function extractDisciplines(string $text): array
    {
        $disciplines = [];
        foreach (preg_split('/\R/u', $text) as $line) {
            if (preg_match('/(\d{6})-[A-Z]+-\d{4}(?:-\d)?\s*\t?\s*\d+\s*(.+)$/u', trim($line), $match)) {
                $title = trim($match[2]);
                if ($title !== '' && ! preg_match('/^\d+$/', $title)) {
                    $disciplines[$match[1]] = $title;
                }
            }
        }

        return $disciplines;
    }

    /**
     * Reads the original PDF drawing commands instead of getDataTm(). Some
     * UEPG PDFs use several Tm/Tj pairs in one text block and getDataTm()
     * associates the text with the following position, shifting cells.
     */
    private function extractSlotsFromCommands(array $commands, array $disciplines): array
    {
        $columns = [];
        $x = 0.0;
        $y = 0.0;
        $currentTime = null;
        $scheduleSeen = false;
        $cells = [];

        foreach ($commands as $command) {
            if (($command['o'] ?? null) === 'Tm') {
                $matrix = preg_split('/\s+/', trim($command['c'] ?? ''));
                $x = (float) ($matrix[4] ?? 0);
                $y = (float) ($matrix[5] ?? 0);
                continue;
            }

            if (($command['o'] ?? null) !== 'Tj') {
                continue;
            }

            $value = preg_replace('/\s+/u', ' ', trim($command['c'] ?? ''));
            if ($value === '') {
                continue;
            }

            if ($value === 'Horário das Aulas') {
                $scheduleSeen = true;
                continue;
            }

            if (isset(self::DAY_NUMBERS[$value])) {
                // Header labels are centered and some PDFs omit empty days.
                // Body cells always start at 92 and advance 64 points.
                $columns[] = [
                    'x' => 92.0 + (64.0 * count($columns)),
                    'day' => self::DAY_NUMBERS[$value],
                ];
                continue;
            }

            if (preg_match('/^\d{2}:\d{2}$/', $value)) {
                // Continuation pages omit the "Horário das Aulas" heading.
                $scheduleSeen = true;
                $currentTime = $value;
                continue;
            }

            if (! $scheduleSeen || $currentTime === null || $y < 100) {
                continue;
            }

            $day = null;
            $distance = INF;
            foreach ($columns as $column) {
                $candidateDistance = abs($x - $column['x']);
                if ($candidateDistance < $distance) {
                    $day = $column['day'];
                    $distance = $candidateDistance;
                }
            }

            if ($day === null || $distance > 12) {
                continue;
            }

            $cells[$currentTime][$day][] = $value;
        }

        $slots = [];
        foreach ($cells as $time => $days) {
            foreach ($days as $day => $fragments) {
                $content = preg_replace('/\s+/u', ' ', implode(' ', $fragments));
                preg_match_all(
                    '/(\d{6})-([A-Z]+)-(.+?)(?=\s+\d{6}-|$)/u',
                    $content,
                    $matches,
                    PREG_SET_ORDER,
                );

                foreach ($matches as $match) {
                    $code = $match[1];
                    $location = preg_replace('/\s+/u', '', trim($match[2].'-'.$match[3], " -\t\n\r\0\x0B"));
                    $slots[] = [
                        'title' => $disciplines[$code] ?? "Disciplina {$code}",
                        'code' => $code,
                        'location' => $location,
                        'day_of_week' => $day,
                        'start_time' => $time,
                    ];
                }
            }
        }

        return $slots;
    }

    private function extractSlots(array $items, string $text, array $disciplines): array
    {
        $scheduleStarted = false;
        $times = [];
        $meetings = [];
        $pendingRoomFragments = [];
        $order = 0;

        foreach ($items as $item) {
            $matrix = $item[0] ?? [];
            $value = preg_replace('/\s+/u', ' ', trim($item[1] ?? ''));
            if ($value === '') {
                continue;
            }

            if ($value === 'Horário das Aulas') {
                $scheduleStarted = true;
                continue;
            }

            if (! $scheduleStarted) {
                continue;
            }

            if (str_starts_with($value, 'Os dados deste documento') || $value === 'NTI') {
                break;
            }

            $x = (float) ($matrix[4] ?? 0);
            $y = (float) ($matrix[5] ?? 0);

            if (preg_match('/^\d{2}:\d{2}$/', $value)) {
                $times[] = ['time' => $value, 'x' => $x, 'y' => $y, 'order' => $order++];
                continue;
            }

            if (preg_match('/^(20\d{4})-([A-Z]+)-(.+?)-?$/', $value, $match)) {
                $meetings[] = [
                    'base_code' => $match[1],
                    'raw' => rtrim($value, '-'),
                    'location_prefix' => $match[2],
                    'location_tail' => trim($match[3], '-'),
                    'x' => $x,
                    'y' => $y,
                    'order' => $order++,
                ];
                continue;
            }

            if (preg_match('/^\d{1,3}$/', $value)) {
                $pendingRoomFragments[] = ['value' => $value, 'y' => $y, 'order' => $order++];
            }
        }

        if ($times === [] || $meetings === []) {
            return [];
        }

        usort($times, fn (array $a, array $b) => $a['order'] <=> $b['order']);
        usort($meetings, fn (array $a, array $b) => $a['order'] <=> $b['order']);

        // Some UEPG PDFs reset the text matrix for the last cell. Preserve document
        // order and attach every meeting to the closest visible time row first.
        foreach ($meetings as $index => &$meeting) {
            $closest = null;
            $distance = INF;
            foreach ($times as $timeIndex => $time) {
                $candidate = abs($meeting['y'] - $time['y']);
                if ($candidate < $distance && $candidate <= 16) {
                    $closest = $timeIndex;
                    $distance = $candidate;
                }
            }

            if ($closest === null) {
                $previousMeetings = array_slice($meetings, 0, $index);
                $usedRows = array_column($previousMeetings, 'time_index');
                $closest = min(count($times) - 1, max($usedRows ?: [count($times) - 2]) + 1);
            }
            $meeting['time_index'] = $closest;
        }
        unset($meeting);

        // Continuation-only room numbers are written as separate PDF blocks.
        foreach ($pendingRoomFragments as $fragment) {
            $bestIndex = null;
            foreach ($meetings as $index => $meeting) {
                if ($meeting['order'] < $fragment['order'] && ! isset($meetings[$index]['room_fragment'])) {
                    $bestIndex = $index;
                }
            }
            if ($bestIndex !== null) {
                $meetings[$bestIndex]['room_fragment'] = $fragment['value'];
            }
        }

        $headerDays = $this->extractHeaderDays($text);
        $signatureDays = [];
        $slots = [];

        foreach ($times as $timeIndex => $time) {
            $row = array_values(array_filter($meetings, fn (array $meeting) => $meeting['time_index'] === $timeIndex));
            if ($row === []) {
                continue;
            }

            foreach ($row as $position => $meeting) {
                $signature = $meeting['raw'].':'.($meeting['room_fragment'] ?? '');
                $day = $signatureDays[$signature] ?? $this->inferDay($meeting, $row, $position, $headerDays);
                $signatureDays[$signature] = $day;

                $locationParts = array_filter([
                    $meeting['location_prefix'],
                    $meeting['location_tail'],
                    $meeting['room_fragment'] ?? null,
                ]);

                $slots[] = [
                    'title' => $disciplines[$meeting['base_code']] ?? "Disciplina {$meeting['base_code']}",
                    'code' => $meeting['base_code'],
                    'location' => implode('-', $locationParts),
                    'day_of_week' => $day,
                    'start_time' => $time['time'],
                ];
            }
        }

        return $this->addEndTimes($slots);
    }

    private function extractHeaderDays(string $text): array
    {
        preg_match('/Horário das Aulas\s*\R([^\r\n]+)/u', $text, $match);
        $line = $match[1] ?? 'Segunda Terça Quarta Quinta Sexta';
        $days = [];
        foreach (self::DAY_NUMBERS as $label => $number) {
            if (str_contains($line, $label)) {
                $days[] = $number;
            }
        }

        return array_values(array_unique($days ?: [1, 2, 3, 4, 5]));
    }

    private function inferDay(array $meeting, array $row, int $position, array $headerDays): int
    {
        if ($meeting['x'] >= 80 && $meeting['x'] < 145) {
            return $headerDays[0] ?? 1;
        }

        if ($meeting['x'] >= 270 || $meeting['x'] < 60) {
            return $headerDays[array_key_last($headerDays)] ?? 5;
        }

        if (count($row) > 1) {
            $interiorDays = array_slice($headerDays, 1, -1) ?: $headerDays;
            return $interiorDays[min($position, count($interiorDays) - 1)];
        }

        return $headerDays[min(1, count($headerDays) - 1)] ?? 2;
    }

    private function addEndTimes(array $slots): array
    {
        $times = array_values(array_unique(array_column($slots, 'start_time')));
        usort($times, fn (string $a, string $b) => strcmp($a, $b));

        foreach ($slots as &$slot) {
            $index = array_search($slot['start_time'], $times, true);
            $current = CarbonImmutable::createFromFormat('H:i', $slot['start_time']);
            $duration = 50;

            if (isset($times[$index + 1])) {
                $next = CarbonImmutable::createFromFormat('H:i', $times[$index + 1]);
                $difference = abs($current->diffInMinutes($next));
                if ($difference >= 45 && $difference <= 70) {
                    $duration = $difference;
                }
            }

            if ($duration === 50 && $index > 0) {
                $previous = CarbonImmutable::createFromFormat('H:i', $times[$index - 1]);
                $difference = abs($previous->diffInMinutes($current));
                if ($difference >= 45 && $difference <= 70) {
                    $duration = $difference;
                }
            }

            $slot['end_time'] = $current->addMinutes($duration)->format('H:i');
        }
        unset($slot);

        return $slots;
    }

    private function mergeConsecutiveSlots(array $slots): array
    {
        $groups = [];
        foreach ($slots as $slot) {
            $key = implode('|', [$slot['day_of_week'], $slot['code'], $slot['location']]);
            $groups[$key][] = $slot;
        }

        $merged = [];
        foreach ($groups as $group) {
            usort($group, fn (array $a, array $b) => $a['start_time'] <=> $b['start_time']);
            $groupMerged = [];
            foreach ($group as $slot) {
                $lastIndex = array_key_last($groupMerged);
                $last = $lastIndex !== null ? $groupMerged[$lastIndex] : null;
                if ($last && $last['end_time'] === $slot['start_time']) {
                    $groupMerged[$lastIndex]['end_time'] = $slot['end_time'];
                    continue;
                }

                $slot['day_label'] = array_search($slot['day_of_week'], self::DAY_NUMBERS, true) ?: 'Dia';
                $groupMerged[] = $slot;
            }
            array_push($merged, ...$groupMerged);
        }

        usort($merged, fn (array $a, array $b) => [$a['day_of_week'], $a['start_time'], $a['title']] <=> [$b['day_of_week'], $b['start_time'], $b['title']]);

        return $merged;
    }
}
