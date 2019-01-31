"use strict";

console.log('working');

async function makeDownload() {

    // Placeholder for things that take a long time to tar up.
    let target_location = document.getElementById('dlink');
    let download_placeholder = document.createElement('p');
    let creating_file = document.createTextNode('Creating tar file...');
    let filename = document.getElementById('filename').value;
    let file_source = document.getElementById('filesource').value;
    download_placeholder.appendChild(creating_file);
    target_location.appendChild(download_placeholder);

    // We're just downloading the boilerplate tarball right now.
    let boilerplate_path = "https://harvardx.github.io/edx_course_templater/boilerplate_course/";
    let boilerplate_structure_path = "https://harvardx.github.io/edx_course_templater/boilerplate_course.txt";
    let course_tarball;


    // Get the flat file that describes the boilerplate course.
    let boilerplate_flat = await readCourseFlatFile(file_source, async function(result){

        // console.log('course structure:');
        // console.log(result);

        // Take the tar and make a download link with it.
        function makeDownloadLink(tar){
            let written = tar.write()
                .then( (tarblob) => {
                    // console.log('tar written');
                    // console.log(tarblob);

                    // Remove the placeholder and put in the download link.
                    let download_link = document.createElement('a');
                    let click_to_download_txt = document.createTextNode('Click to download archive');

                    target_location.removeChild(download_placeholder);
                    download_link.setAttribute('href', URL.createObjectURL(tarblob) );
                    download_link.setAttribute('download', filename);

                    download_link.appendChild(click_to_download_txt);
                    target_location.appendChild(download_link);
            });
        }

        // Construct a tarball from the flat file.
        course_tarball = await makeTarFromFlatFile(result, boilerplate_path, makeDownloadLink);

    });
}

function readCourseFlatFile(filepath, callback){
    console.log('reading course flat file ' + filepath);

    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("text/plain");
    rawFile.onreadystatechange = function() {
        // console.log(rawFile.readyState, rawFile.status);
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            // console.log('file:');
            // console.log(rawFile.responseText);
            callback(rawFile.responseText);
        }
    }
    rawFile.open("GET", filepath, true);
    rawFile.send(null);

}

async function makeTarFromFlatFile(f, path, makeDownloadLink){
    let textlines = f.split('\n');
    console.log('Making course tarball from...');
    console.log(textlines);

    let tar = new tarball.TarWriter();
    let filecounter = 0;

    textlines.forEach(async function(row){

        // console.log(row);

        // Taking off the ./ from start of each. Artifact of using "find" command.
        if(row.slice(0,2) == './'){
            row = row.slice(2);
        }

        // Ignore invisible files.
        if(row[0] == '.') {
            filecounter++;
        }else{
            // Add the files as you get them.
            let thefile = await fetch(path + row)
                .then(res => res.blob())
                .then(blob => {
                    // console.log('blob obtained');
                    // console.log(blob);
                    // Sweet functionality note: folders are added automatically
                    // because the row text has the folder name and a slash.
                    tar.addFile(row, blob );
                    filecounter++;
            });
        }
        if(filecounter == textlines.length){
            console.log('tar complete');
            makeDownloadLink(tar);
        }

    });

}
