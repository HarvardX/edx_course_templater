"use strict";

// let tar = require('tar');

function makeDownload() {

    let filename = document.getElementById('filename').value;
    let file_source = document.getElementById('filesource').value;

    let tar = new tarball.TarWriter();
    tar.addFile(file_source.substring(file_source.lastIndexOf('/')+1), file_source);

    let download_link = document.createElement('a');
    download_link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tar.write()) );
    download_link.setAttribute('download', filename);

    let download_text = 'Click here to download.';
    let text_node = document.createTextNode(download_text);
    download_link.appendChild(text_node);

    let target_location = document.getElementById('dlink');
    target_location.appendChild(download_link);

}
