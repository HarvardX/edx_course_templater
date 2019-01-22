"use strict";

// let tar = require('tar');

async function makeDownload() {

    let target_location = document.getElementById('dlink');
    let download_placeholder = document.createElement('p');
    let creating_file = document.createTextNode('Creating tar file...');

    let filename = document.getElementById('filename').value;
    let file_source = document.getElementById('filesource').value;

    download_placeholder.appendChild(creating_file);
    target_location.appendChild(download_placeholder);

    let tar = new tarball.TarWriter();
    let thefile = await fetch(file_source)
        .then(res => res.blob())
        .then(blob => {
            console.log(blob);
            tar.addFile('testfile.txt', blob );
    });

    let tarblob = await tar.write()
        .then( (tb) => {
            let download_link = document.createElement('a');
            let click_to_download_txt = document.createTextNode('Click to download archive');

            target_location.removeChild(download_placeholder);
            download_link.setAttribute('href', URL.createObjectURL(tb) );
            download_link.setAttribute('download', filename);

            download_link.appendChild(click_to_download_txt);
            target_location.appendChild(download_link);
    });

}
