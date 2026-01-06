<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class VerifyMinIOSetup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'minio:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify MinIO configuration and connectivity';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Verifying MinIO Setup...');
        $this->newLine();

        $errors = 0;

        try {
            // Test 1: Check disk configuration
            $this->info('1. Checking MinIO disk configuration...');
            $disk = Storage::disk('minio');
            $this->line('   ✅ MinIO disk loaded successfully');

            // Test 2: Display configuration
            $this->newLine();
            $this->info('2. MinIO Configuration:');
            $bucket = config('filesystems.disks.minio.bucket');
            $endpoint = config('filesystems.disks.minio.endpoint');
            $url = config('filesystems.disks.minio.url');

            $this->table(
                ['Setting', 'Value'],
                [
                    ['Bucket', $bucket],
                    ['Endpoint (Internal)', $endpoint],
                    ['Public URL', $url],
                    ['Region', config('filesystems.disks.minio.region')],
                ]
            );

            // Test 3: Write test file
            $this->newLine();
            $this->info('3. Testing write operation...');
            $testFile = 'test-verify-' . time() . '.txt';
            $testContent = 'MinIO verification test - ' . now()->toDateTimeString();

            $disk->put($testFile, $testContent);
            $this->line('   ✅ Successfully wrote test file');

            // Test 4: Read test file
            $this->info('4. Testing read operation...');
            $content = $disk->get($testFile);

            if ($content === $testContent) {
                $this->line('   ✅ Successfully read test file');
            } else {
                $this->error('   ❌ File content mismatch!');
                $errors++;
            }

            // Test 5: Check file exists
            $this->info('5. Testing exists check...');
            if ($disk->exists($testFile)) {
                $this->line('   ✅ File exists check passed');
            } else {
                $this->error('   ❌ File exists check failed!');
                $errors++;
            }

            // Test 6: Get file URL
            $this->info('6. Testing URL generation...');
            $fileUrl = $disk->url($testFile);
            $this->line("   ✅ Generated URL: {$fileUrl}");

            // Test 7: Get file size
            $this->info('7. Testing file metadata...');
            $size = $disk->size($testFile);
            $this->line("   ✅ File size: {$size} bytes");

            // Test 8: List files
            $this->info('8. Testing directory listing...');
            $files = $disk->files();
            $this->line('   ✅ Listed ' . count($files) . ' file(s) in bucket');

            // Cleanup
            $this->info('9. Cleaning up...');
            $disk->delete($testFile);
            $this->line('   ✅ Test file deleted');

            // Summary
            $this->newLine();
            if ($errors === 0) {
                $this->info('🎉 SUCCESS! MinIO is configured correctly and working perfectly!');
                $this->newLine();
                $this->line('You can now upload images through:');
                $this->line('  • ImageService (properties, blog posts, etc.)');
                $this->line('  • Storage::disk(\'minio\')->put($path, $content)');
                $this->newLine();
                $this->line("Images will be accessible at: {$url}/...");

                return Command::SUCCESS;
            } else {
                $this->error("❌ {$errors} test(s) failed. Please check your MinIO configuration.");
                return Command::FAILURE;
            }

        } catch (\Exception $e) {
            $this->newLine();
            $this->error('❌ MinIO verification failed!');
            $this->error('Error: ' . $e->getMessage());
            $this->newLine();
            $this->warn('Common issues:');
            $this->line('  • MinIO service not running: docker-compose ps');
            $this->line('  • Incorrect credentials in .env');
            $this->line('  • Bucket not created: php artisan minio:setup');
            $this->line('  • Network connectivity issues');

            return Command::FAILURE;
        }
    }
}
