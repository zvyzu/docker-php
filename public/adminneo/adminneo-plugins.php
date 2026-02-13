<?php

// Enable plugins.
// Files in `adminneo-plugins` are autoloaded, so it is not necessary to include the source files.
return [
    new \AdminNeo\JsonPreviewPlugin(),
    new \AdminNeo\XmlDumpPlugin(),
    new \AdminNeo\FileUploadPlugin("data/"),
    new \AdminNeo\ForeignEditPlugin(),
    new \AdminNeo\TinyMcePlugin(),
    new \AdminNeo\SystemForeignKeysPlugin(),
    new \AdminNeo\Bz2OutputPlugin(),
    new \AdminNeo\ZipOutputPlugin(),
    new \AdminNeo\JsonDumpPlugin(),
    new \AdminNeo\TranslationPlugin(),
];