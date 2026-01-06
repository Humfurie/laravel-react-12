<?php

namespace App\Console\Commands;

use Aws\S3\S3Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SetupMinIOBucket extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'minio:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup MinIO bucket for Laravel uploads';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Setting up MinIO bucket...');

        try {
            $disk = Storage::disk('minio');
            $client = $disk->getClient();
            $bucket = config('filesystems.disks.minio.bucket');

            // Check if bucket exists, create if not
            if (!$client->doesBucketExist($bucket)) {
                $this->info("Creating bucket: {$bucket}");
                $client->createBucket(['Bucket' => $bucket]);
                $this->info("✅ Bucket created successfully.");
            } else {
                $this->info("ℹ️  Bucket '{$bucket}' already exists.");
            }

            // Always apply/update the bucket policy for public read access
            $this->info("Applying public read policy...");

            $policy = json_encode([
                'Version' => '2012-10-17',
                'Statement' => [
                    [
                        'Effect' => 'Allow',
                        'Principal' => ['AWS' => ['*']],
                        'Action' => ['s3:GetObject'],
                        'Resource' => ["arn:aws:s3:::{$bucket}/*"]
                    ]
                ]
            ]);

            $client->putBucketPolicy([
                'Bucket' => $bucket,
                'Policy' => $policy
            ]);

            $this->info("✅ Public read policy applied successfully!");
            $this->newLine();
            $this->info("Bucket '{$bucket}' is now configured for public read access.");
            $this->info("All objects uploaded to this bucket will be publicly accessible.");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to setup MinIO bucket: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
