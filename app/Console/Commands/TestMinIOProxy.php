<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class TestMinIOProxy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'minio:test-proxy';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test MinIO accessibility and nginx proxy configuration';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🧪 Testing MinIO and Nginx Proxy Configuration...');
        $this->newLine();

        $errors = 0;

        // Test 1: Check MinIO internal connectivity
        $this->info('1. Testing MinIO internal connectivity...');
        try {
            $disk = Storage::disk('minio');
            $testFile = 'proxy-test-' . time() . '.txt';
            $disk->put($testFile, 'Proxy test file');

            if ($disk->exists($testFile)) {
                $this->line('   ✅ MinIO is accessible from Laravel');
                $minioUrl = $disk->url($testFile);
                $this->line("   MinIO URL: {$minioUrl}");

                // Clean up
                $disk->delete($testFile);
            } else {
                $this->error('   ❌ Could not verify file in MinIO');
                $errors++;
            }
        } catch (\Exception $e) {
            $this->error('   ❌ MinIO connection failed: ' . $e->getMessage());
            $errors++;
        }

        // Test 2: Check configuration
        $this->newLine();
        $this->info('2. Checking MinIO configuration...');
        $this->table(
            ['Setting', 'Value'],
            [
                ['Bucket', config('filesystems.disks.minio.bucket')],
                ['Endpoint', config('filesystems.disks.minio.endpoint')],
                ['URL', config('filesystems.disks.minio.url')],
                ['Region', config('filesystems.disks.minio.region')],
            ]
        );

        // Test 3: Create a persistent test file
        $this->newLine();
        $this->info('3. Creating persistent test file...');
        try {
            $disk = Storage::disk('minio');
            $testFile = 'nginx-proxy-test.txt';
            $disk->put($testFile, 'If you can see this, the proxy is working!');

            $internalUrl = config('filesystems.disks.minio.endpoint') . '/' . config('filesystems.disks.minio.bucket') . '/' . $testFile;
            $publicUrl = config('filesystems.disks.minio.url') . '/' . $testFile;

            $this->line('   ✅ Test file created');
            $this->newLine();
            $this->line('   Internal MinIO URL:');
            $this->line("   {$internalUrl}");
            $this->newLine();
            $this->line('   Public URL (through nginx proxy):');
            $this->line("   {$publicUrl}");
        } catch (\Exception $e) {
            $this->error('   ❌ Failed to create test file: ' . $e->getMessage());
            $errors++;
        }

        // Test 4: Test internal MinIO access
        $this->newLine();
        $this->info('4. Testing internal MinIO access...');
        try {
            $response = Http::timeout(5)->get($internalUrl);
            if ($response->successful()) {
                $this->line('   ✅ MinIO responds internally');
                $this->line('   Response: ' . $response->body());
            } else {
                $this->error('   ❌ MinIO returned status: ' . $response->status());
                $errors++;
            }
        } catch (\Exception $e) {
            $this->error('   ❌ Cannot reach MinIO internally: ' . $e->getMessage());
            $errors++;
        }

        // Test 5: Provide instructions for external test
        $this->newLine();
        $this->info('5. Test the public proxy (manual test required):');
        $this->line('   Open this URL in your browser:');
        $this->line("   {$publicUrl}");
        $this->newLine();
        $this->line('   Expected: "If you can see this, the proxy is working!"');
        $this->line('   If you get 404: Nginx proxy is not configured correctly');
        $this->line('   If you get Access Denied: Bucket policy is not applied');

        // Summary
        $this->newLine();
        if ($errors === 0) {
            $this->info('✅ All internal tests passed!');
            $this->info('   Now test the public URL above to verify nginx proxy.');
        } else {
            $this->error("❌ {$errors} test(s) failed.");
            $this->error('   Please check your MinIO configuration.');
        }

        return $errors === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}
