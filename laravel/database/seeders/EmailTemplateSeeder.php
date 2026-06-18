<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'title' => 'Solicitar ajuda ao professor',
                'category' => 'professor',
                'subject' => 'Dúvida sobre {disciplina}',
                'body' => "Olá, Professor(a) {professor},\n\nMeu nome é {nome} e sou estudante da disciplina {disciplina}.\n\nGostaria de tirar uma dúvida sobre o conteúdo abordado. Poderia me indicar um horário disponível para atendimento ou responder por e-mail?\n\nAgradeço desde já.\n\nAtenciosamente,\n{nome}",
                'order' => 1,
            ],
            [
                'title' => 'Comunicar ausência ao professor',
                'category' => 'professor',
                'subject' => 'Ausência na aula de {disciplina}',
                'body' => "Olá, Professor(a) {professor},\n\nMeu nome é {nome}, estudante da disciplina {disciplina}.\n\nVenho informar que não poderei comparecer à aula do próximo dia por motivos de saúde. Poderia me orientar sobre como repor o conteúdo?\n\nAtenciosamente,\n{nome}",
                'order' => 2,
            ],
            [
                'title' => 'Solicitar participação em grupo',
                'category' => 'group',
                'subject' => 'Participação no grupo de {disciplina}',
                'body' => "Olá!\n\nMeu nome é {nome} e gostaria de fazer parte do grupo de trabalho da disciplina {disciplina}.\n\nEstou disponível para colaborar e contribuir com as atividades propostas.\n\nAguardo retorno.\n\n{nome}",
                'order' => 3,
            ],
            [
                'title' => 'Combinar horário de reunião',
                'category' => 'group',
                'subject' => 'Reunião do grupo — {disciplina}',
                'body' => "Olá, pessoal!\n\nSou o(a) {nome} e gostaria de sugerir um horário para a nossa próxima reunião do grupo da disciplina {disciplina}.\n\nPor favor, respondam com os horários que ficam disponíveis para vocês.\n\n{nome}",
                'order' => 4,
            ],
            [
                'title' => 'Solicitar informações à coordenação',
                'category' => 'coordination',
                'subject' => 'Solicitação de informações',
                'body' => "Prezada Coordenação,\n\nMeu nome é {nome}, estudante do curso de {disciplina}.\n\nGostaria de obter informações sobre [descreva sua necessidade]. Poderia me orientar sobre os próximos passos?\n\nAgradeço a atenção.\n\n{nome}",
                'order' => 5,
            ],
            [
                'title' => 'Solicitar adaptação de avaliação',
                'category' => 'coordination',
                'subject' => 'Solicitação de adaptação de avaliação — {disciplina}',
                'body' => "Prezada Coordenação,\n\nMeu nome é {nome} e sou estudante com laudo que indica necessidade de adaptação nas avaliações.\n\nVenho solicitar orientações sobre o processo para formalizar a solicitação de adaptação na disciplina {disciplina}, conforme previsto nas políticas de inclusão da universidade.\n\nAgradeço a atenção.\n\n{nome}",
                'order' => 6,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::create(array_merge($template, ['is_active' => true]));
        }
    }
}
