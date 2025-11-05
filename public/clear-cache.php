<?php
// Clear OPcache
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "OpCache cleared!\n";
} else {
    echo "OpCache not available.\n";
}

// Clear Laravel view cache
$viewPath = __DIR__ . '/../storage/framework/views';
if (is_dir($viewPath)) {
    $files = glob($viewPath . '/*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    echo "View cache cleared!\n";
}

echo "Done! Now test your page.\n";
