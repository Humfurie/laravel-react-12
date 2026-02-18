<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;
use Laravel\Mcp\Server\Prompts\Arguments;
use Laravel\Mcp\Server\Prompts\PromptResult;

class ContentAssistant extends Prompt
{
    protected string $description = 'Get AI assistance for creating or improving portfolio content.';

    public function arguments(): Arguments
    {
        return (new Arguments)
            ->add(new Argument(
                name: 'task',
                description: 'What to help with: write_blog, improve_description, suggest_tags, review_content, write_case_study',
                required: true,
            ))
            ->add(new Argument(
                name: 'context',
                description: 'Additional context like a project title, existing content to improve, or topic to write about',
                required: false,
            ));
    }

    public function handle(array $arguments): PromptResult
    {
        $task = $arguments['task'] ?? 'write_blog';
        $context = $arguments['context'] ?? '';

        $prompt = match ($task) {
            'write_blog' => $this->writeBlogPrompt($context),
            'improve_description' => $this->improveDescriptionPrompt($context),
            'suggest_tags' => $this->suggestTagsPrompt($context),
            'review_content' => $this->reviewContentPrompt($context),
            'write_case_study' => $this->writeCaseStudyPrompt($context),
            default => "Help me with the following task for my portfolio site: {$task}. Context: {$context}",
        };

        return new PromptResult($prompt, "Content assistance for: {$task}");
    }

    private function writeBlogPrompt(string $context): string
    {
        return <<<PROMPT
        You are a technical blog writer for a software developer's portfolio site.
        Write a well-structured blog post about: {$context}

        Requirements:
        - Use clear, engaging technical writing
        - Include code examples where appropriate (in HTML format for the content field)
        - Structure with introduction, main sections, and conclusion
        - Keep a professional but approachable tone
        - Suggest appropriate tags for the post

        After writing, use the create-blog tool to save it as a draft.
        PROMPT;
    }

    private function improveDescriptionPrompt(string $context): string
    {
        return <<<PROMPT
        Review and improve this project/deployment description for a portfolio site:

        {$context}

        Focus on:
        - Clear explanation of what was built
        - Technical details that demonstrate skill
        - Impact and results where possible
        - Professional tone suitable for potential clients/employers
        PROMPT;
    }

    private function suggestTagsPrompt(string $context): string
    {
        return <<<PROMPT
        Based on the following blog content, suggest 3-8 relevant tags:

        {$context}

        Return tags as a JSON array of lowercase strings. Focus on technologies, concepts, and topics covered.
        PROMPT;
    }

    private function reviewContentPrompt(string $context): string
    {
        return <<<PROMPT
        Review this portfolio content for quality, accuracy, and professionalism:

        {$context}

        Check for:
        - Grammar and spelling errors
        - Technical accuracy
        - Clarity and readability
        - SEO-friendly structure
        - Professional tone

        Provide specific suggestions for improvement.
        PROMPT;
    }

    private function writeCaseStudyPrompt(string $context): string
    {
        return <<<PROMPT
        Write a case study for this project on a developer portfolio site:

        {$context}

        Structure:
        1. Challenge: What problem was being solved?
        2. Approach: What technologies and strategies were used?
        3. Solution: What was built?
        4. Results: What was the impact?

        Keep it concise (300-500 words) and focused on demonstrating technical competence.
        PROMPT;
    }
}
