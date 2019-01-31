"use strict";

console.log('working');

$(document).ready(function(){
    // Visibility toggle for headers and footers.
    $('.headfoot').on('change', function(){
        $(this).siblings('div:first-of-type').slideToggle();
    });

    // When the page loads, or when anything changes,
    // build the template by which we make the tarball.
    constructCourseTemplate();
    $('input').on('change', function(e){
        // console.log(e);
        constructCourseTemplate();
    });
});


// This builds the user-defined part of the course, without the boilerplate.
function constructCourseTemplate(){
    // The template is an array of objects that look like this:
    // {
    //  'path': 'path to final file',
    //  'text': 'inner xml for file'
    // }
    let template = [];

    let courseXML = $(`<course advanced_modules="[&quot;openassessment&quot;, &quot;word_cloud&quot;, &quot;lti_consumer&quot;, &quot;split_test&quot;, &quot;library_content&quot;, &quot;poll&quot;, &quot;survey&quot;, &quot;ubcpi&quot;, &quot;drag-and-drop-v2&quot;, &quot;done&quot;]" cert_html_view_enabled="true" display_name="HarvardX Boilerplate" language="en" start="&quot;2030-01-01T00:00:00+00:00&quot;">
  <chapter url_name="ae4d34a5898348ec8f02796adfd3c211"/>
  <chapter url_name="bc94ec689194454dbc8148b3e53fc80c"/>
  <chapter url_name="cceae70553594a3dbdd65da2d9e7fd11"/>
  <wiki slug="HarvardX.HX102.3T2018"/>
</course>`);

    let sections = $('#numsections').val();
    let subsections = $('#numsubsections').val();
    let pages = $('#numpages').val();

    // Core part of the page
    let coreTag = '';
    if( $('#usehtml')[0].checked  ){ coreTag = 'html'; }
    if( $('#usevideo')[0].checked ){ coreTag = 'video'; }
    if( $('#useprob')[0].checked  ){ coreTag = 'problem'; }
    if( $('#usespec')[0].checked  ){ coreTag = $('#whatcustom').val(); }

    let numCoreElements = 1;
    if(coreTag === 'problem'){
        numCoreElements = Number($('#numprob').val());
    }

    // problem on every page
    let prob_on_every_page = $('#poep')[0].checked;
    // discussion on every page
    let disc_on_every_page = $('#doep')[0].checked;
    // discussion has text intro
    let disc_has_intro = $('#dhti')[0].checked;
    // video has text intro
    let vid_has_intro = $('#vhti')[0].checked;

    let subsHaveHeaders = $('#headerpage')[0].checked;
    let subsHaveFooters = $('#footerpage')[0].checked;
    let sectHaveHeaders = $('#headerss')[0].checked;
    let sectHaveFooters = $('#footerss')[0].checked;

    for(let s = 0; s < sections; s++){
        let chapter_innards = '';

        for(let ss = 0; ss < subsections; ss++){
            let sequential_innards = '';

            // add tags for subsection header page
            if(subsHaveHeaders){

            }

            for(let p = 0; p < pages; p++){
                let vertical_innards = '';

                if(vid_has_intro){
                    if(coreTag == 'video'){
                        let vhti_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_vidintro.xml';
                        vertical_innards += '<html url_name=' + vhti_file + '>\n';
                        template.push({
                            'path': 'html/' + vhti_file,
                            'text': '<html>\n</html>'
                        });
                        template.push({
                            'path': 'html/' + vhti_file.slice(0,-3)+'html',
                            'text': '<html>\n</html>'
                        });
                    }
                }

                // add content page tags
                for(let cf = 0; cf < numCoreElements; cf++){
                    let core_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_' + coreTag + '_' + (cf+1) + '.xml'
                    vertical_innards += '<' + coreTag + ' url_name=' + core_file + '>\n';
                    template.push({
                        'path': coreTag + '/' + core_file,
                        'text': '<' + coreTag +'>\n</' + coreTag + '>'
                    });
                    if(coreTag === 'html'){
                        template.push({
                            'path': 'html/' + core_file.slice(0,-3)+'html',
                            'text': '<html>\n</html>'
                        });
                    }
                }

                if(prob_on_every_page){
                    let poep_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_problem_x.xml';
                    vertical_innards += '<problem url_name=' + poep_file + '>\n';
                    template.push({
                        'path': 'problem/' + poep_file,
                        'text': '<problem>\n</problem>'
                    });

                }

                if(disc_on_every_page){
                    if(disc_has_intro){
                        let dhti_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_discintro.xml';
                        vertical_innards += '<html url_name=' + dhti_file + '>\n';
                        template.push({
                            'path': 'html/' + dhti_file,
                            'text': '<html>\n</html>'
                        });
                        template.push({
                            'path': 'html/' + dhti_file.slice(0,-3)+'html',
                            'text': '<html>\n</html>'
                        });
                    }
                    let doep_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_problem_x.xml';
                    vertical_innards += '<discussion url_name=' + doep_file + ' xblock-family="xblock.v1" discussion_category="Chapter ' + (s+1) + '">\n'
                    // no need to add to template, only declared inline.
                }

                // add vertical tag to template
                let vert_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '.xml';
                template.push({
                    'path': 'vertical/' + vert_file,
                    'text': '<vertical>\n' + vertical_innards + '\n</vertical>'
                });
                sequential_innards += '<vertical url_name=' + vert_file + '/>\n';
            }

            // add tags for subsection footer page
            if(subsHaveFooters){

            }

            // add sequential tag to template
            let seq_file = 's_' + (s+1) + '_ss_' + (ss+1) + '.xml';
            template.push({
                'path': 'sequential/' + seq_file,
                'text': '<sequential>\n' + sequential_innards + '\n</sequential>'
            });
            chapter_innards += '<sequential url_name=' + seq_file + '/>';
        }
        // add chapter tag to template
        template.push({
            'path': 'chapter/' + (s+1) + '.xml',
            'text': '<chapter>\n' + chapter_innards + '\n</chapter>'
        });

    }

    console.log(template);
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
                    tar.addFile(row, blob);
                    filecounter++;
            });
        }
        if(filecounter == textlines.length){
            console.log('tar complete');
            makeDownloadLink(tar);
        }

    });

}


// This is our "main"
async function makeDownload() {

    // Insert placeholder text while we wait for things to tar up.
    let target_location = $('#dlink');
    let download_placeholder = $('<p>Creating tar file...</p>');
    let filename = $('#filename').val();
    let file_source = $('#filesource').val();
    target_location.append(download_placeholder);

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
                    let download_link = $('<a>Click to download archive</a>');
                    download_placeholder.remove();
                    download_link.attr('href', URL.createObjectURL(tarblob) );
                    download_link.attr('download', filename);
                    target_location.append(download_link);
            });
        }

        // Construct a tarball from the flat file.
        course_tarball = await makeTarFromFlatFile(result, boilerplate_path, makeDownloadLink);

    });
}
