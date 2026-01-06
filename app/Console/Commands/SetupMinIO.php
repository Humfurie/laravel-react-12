<?php

namespace App\Console\Commands;

use Aws\S3\S3Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SetupMinIO extends Command
{
    protected $signature = 'minio:setup';

    protected $description = 'Setup MinIO bucket with public read access';

    public function handle()
    {
        $this->info('Setting up MinIO bucket...');

        try {
            $config = config('filesystems.disks.minio');
            $bucketName = $config['bucket'];

            // Create S3 client
            $client = new S3Client([
                'version' => 'latest',
                'region' => $config['region'],
                'endpoint' => $config['endpoint'],
                'use_path_style_endpoint' => true,
                'credentials' => [
                    'key' => $config['key'],
                    'secret' => $config['secret'],
                ],
            ]);

            // Check if bucket exists
            if (!$client->doesBucketExist($bucketName)) {
                $this->info("Creating bucket: {$bucketName}");
                $client->createBucket(['Bucket' => $bucketName]);
                $this->info('Bucket created successfully!');
            } else {
                $this->info("Bucket already exists: {$bucketName}");
            }

            // Set bucket policy for public read access
            $policy = json_encode([
                'Version' => '2012-10-17',
                'Statement' => [
                    [
                        'Effect' => 'Allow',
                        'Principal' => ['AWS' => ['*']],
                        'Action' => ['s3:GetObject'],
                        'Resource' => ["arn:aws:s3:::{$bucketName}/*"],
                    ],
                ],
            ]);

            $client->putBucketPolicy([
                'Bucket' => $bucketName,
                'Policy' => $policy,
            ]);

            $this->info('Bucket policy set to public read access!');
            $this->info('MinIO setup completed successfully!');

            return 0;
        } catch (\Exception $e) {
            $this->error('Error setting up MinIO: ' . $e->getMessage());

            return 1;
        }
    }
}
