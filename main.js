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
        console.log(constructCourseTemplate());
    });

    $('input[name="corecontent"]').on('change', function(){
        if($('input[name="corecontent"]:checked').val() === 'special'){
            $('#whatcustom').removeClass('disabled');
        }else{
            $('#whatcustom').addClass('disabled');
        }
    });
    $('#whatcustom').on('focus', function(){
        $('#usespec').click();
    });

    $('input[name="corecontent"]').on('change', function(){
        if($('input[name="corecontent"]:checked').val() === 'problem'){
            $('#numprob').removeClass('disabled');
        }else{
            $('#numprob').addClass('disabled');
        }
    });
    $('#numprob').on('focus', function(){
        $('#useprob').click();
    });
});

// add content page tags
function makeContentPageTags(h_name, tag, num_elem){
    let temp = [];
    let innards = '';

    for(let n = 0; n < num_elem; n++){
        let head_file = h_name + tag + '_' + (n+1) + '.xml';
        innards += '<' + tag + ' url_name="' + head_file.slice(0,-4) + '" />\n';
        if(tag === 'html'){
            temp.push({
                'path': 'html/' + head_file,
                'text': '<html display_name="Text/HTML" filename="' + head_file.slice(0,-4) + '" />'
            });
            temp.push({
                'path': 'html/' + head_file.slice(0,-3)+'html',
                'text': '<html>\n</html>'
            });
        }else{
            temp.push({
                'path': tag + '/' + head_file,
                'text': '<' + tag +' display_name="' + tag + '">\n</' + tag + '>'
            });
        }
    }
    return {'array': temp, 'innards': innards};

}


// This builds the user-defined part of the course, without the boilerplate.
function constructCourseTemplate(){
    // The template is an array of objects that look like this:
    // {
    //  'path': 'path to final file',
    //  'text': 'inner xml for file'
    // }
    let template = [];

    let sections = $('#numsections').val();
    let subsections = $('#numsubsections').val();
    let pages = $('#numpages').val();

    // Core part of the page
    let coreTag = $('input[name="corecontent"]:checked').val();
    if( coreTag === 'special' ){ coreTag = $('#whatcustom').val(); }

    let numCoreElements = 1;
    if(coreTag === 'problem'){
        numCoreElements = Number($('#numprob').val());
    }

    let prob_on_every_page = $('#poep')[0].checked;
    let disc_on_every_page = $('#doep')[0].checked;
    let disc_has_intro = $('#dhti')[0].checked;
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
                let head_tag = $('input[name="unitheaders"]:checked').val();
                // console.log(head_tag);
                if( head_tag === 'special' ){ head_tag = $('#whatcustomhead').val(); }
                let num_head_elements = head_tag === 'problem' ? Number($('#numsshprob').val()) : 1;
                let h_name = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_head_';
                let h_tags = makeContentPageTags(h_name, head_tag, num_head_elements);

                template.push(...h_tags.array);

                template.push({
                    'path': 'vertical/' + 's_' + (s+1) + '_ss_' + (ss+1) + '_p_head.xml',
                    'text': '<vertical display_name="Subsection ' + (ss+1) + ' intro">\n' + h_tags.innards + '</vertical>'
                });
                sequential_innards += '  <vertical url_name="s_' + (s+1) + '_ss_' + (ss+1) + '_p_head" />\n';

            }

            for(let p = 0; p < pages; p++){
                let vertical_innards = '';

                if(vid_has_intro){
                    if(coreTag == 'video'){
                        let vhti_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_vidintro.xml';
                        vertical_innards += '<html url_name="' + vhti_file.slice(0,-4) + '" />\n';
                        template.push({
                            'path': 'html/' + vhti_file,
                            'text': '<html filename="' + vhti_file.slice(0,-4) + '" >\n</html>'
                        });
                        template.push({
                            'path': 'html/' + vhti_file.slice(0,-3)+'html',
                            'text': '<html display_name="Text/HTML">\n</html>'
                        });
                    }
                }

                // add content page tags
                let c_name = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_';
                let c_tags = makeContentPageTags(c_name, coreTag, numCoreElements);
                template.push(...c_tags.array);
                vertical_innards += c_tags.innards;

                if(prob_on_every_page){
                    let poep_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_problem_x.xml';
                    vertical_innards += '<problem url_name="' + poep_file.slice(0,-4) + '" />\n';
                    template.push({
                        'path': 'problem/' + poep_file,
                        'text': '<problem display_name="Problem">\n</problem>'
                    });

                }

                if(disc_on_every_page){
                    if(disc_has_intro){
                        let dhti_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_discintro.xml';
                        vertical_innards += '<html url_name="' + dhti_file.slice(0,-4) + '" />\n';
                        template.push({
                            'path': 'html/' + dhti_file,
                            'text': '<html display_name="Text/HTML">\n</html>'
                        });
                        template.push({
                            'path': 'html/' + dhti_file.slice(0,-3)+'html',
                            'text': '<html>\n</html>'
                        });
                    }
                    let doep_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_problem_x.xml';
                    vertical_innards += '<discussion url_name="' + doep_file.slice(0,-4) + '" xblock-family="xblock.v1" discussion_category="Chapter ' + (s+1) + '" />\n'
                    // no need to add to template, only declared inline.
                }

                // add vertical tag to template
                let vert_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '.xml';
                template.push({
                    'path': 'vertical/' + vert_file,
                    'text': '<vertical display_name="Unit ' + (p+1) + '" >\n' + vertical_innards + '</vertical>'
                });
                sequential_innards += '  <vertical url_name="' + vert_file.slice(0,-4) + '" />\n';
            }

            // add tags for subsection footer page
            if(subsHaveFooters){
                let foot_tag = $('input[name="unitfooters"]:checked').val();
                // console.log(foot_tag);
                if( foot_tag === 'special' ){ foot_tag = $('#whatcustomfoot').val(); }
                let num_foot_elements = foot_tag === 'problem' ? Number($('#numssfprob').val()) : 1;
                let f_name = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_head_';
                let f_tags = makeContentPageTags(f_name, foot_tag, num_foot_elements);

                template.push(...f_tags.array);

                template.push({
                    'path': 'vertical/' + 's_' + (s+1) + '_ss_' + (ss+1) + '_p_foot.xml',
                    'text': '<vertical display_name="Subsection ' + (ss+1) + ' outro">\n' + f_tags.innards + '</vertical>'
                });
                sequential_innards += '  <vertical url_name="s_' + (s+1) + '_ss_' + (ss+1) + '_p_foot" />\n';

            }

            // add sequential tag to template
            let seq_file = 's_' + (s+1) + '_ss_' + (ss+1) + '.xml';
            template.push({
                'path': 'sequential/' + seq_file,
                'text': '<sequential display_name="Subsection ' + (ss+1) + '">\n' + sequential_innards + '</sequential>'
            });
            chapter_innards += '  <sequential url_name="' + seq_file.slice(0,-4) + '" />\n';
        }
        // add chapter tag to template
        template.push({
            'path': 'chapter/s_' + (s+1) + '.xml',
            'text': '<chapter display_name="Section ' + (s+1) + '">\n' + chapter_innards + '</chapter>'
        });

    }

    // Pages. Syllabus and Related are always included.
    // let use_syllabus_page  = $('#syllabus')[0].checked;
    // let use_related_page   = $('#related')[0].checked;

    // Right now this isn't working and I'm not sure why.
    // Leaving it uncommented for now.
    let use_faq_page       = $('#faq')[0].checked;
    let use_calendar_page  = $('#calendar')[0].checked;
    let use_glossary_page  = $('#glossary')[0].checked;
    let use_resources_page = $('#resources')[0].checked;

    if(use_faq_page){
        template.push({
            'path': 'tabs/faq.html',
            'text': '<h3>FAQ placeholder</h3>'
        });
    }
    if(use_calendar_page){
        template.push({
            'path': 'tabs/calendar.html',
            'text': '<h3>Calendar placeholder</h3>'
        });
    }
    if(use_glossary_page){
        template.push({
            'path': 'tabs/glossary.html',
            'text': '<h3>Glossary placeholder</h3>'
        });
    }
    if(use_resources_page){
        template.push({
            'path': 'tabs/resources.html',
            'text': '<h3>Resources placeholder</h3>'
        });
    }


    return template;
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

function makeNewCourseXML(template){

    // console.log(template);

    let new_chapters = template.filter(function(row){
        return row.path.slice(0,7) === 'chapter';
    });

    // console.log(new_chapters);

    let course_xml = '<course advanced_modules="[&quot;openassessment&quot;, &quot;word_cloud&quot;, &quot;lti_consumer&quot;, &quot;split_test&quot;, &quot;library_content&quot;, &quot;poll&quot;, &quot;survey&quot;, &quot;ubcpi&quot;, &quot;drag-and-drop-v2&quot;, &quot;done&quot;]" cert_html_view_enabled="true" display_name="HarvardX Boilerplate" language="en" start="&quot;2030-01-01T00:00:00+00:00&quot;">\n';
    course_xml += '  <chapter url_name="ae4d34a5898348ec8f02796adfd3c211"/>\n';

    for(let i = 0; i < new_chapters.length; i++){
        // Cutting off course/ and .xml from path.
        course_xml += '  <chapter url_name="' + new_chapters[i].path.slice(8,-4) + '" />\n'
    }

    course_xml += '  <chapter url_name="bc94ec689194454dbc8148b3e53fc80c"/>\n'
    course_xml += '  <chapter url_name="cceae70553594a3dbdd65da2d9e7fd11"/>\n'
    course_xml += '  <wiki slug="HarvardX.HX102.3T2018"/>\n'
    course_xml += '</course>'

    return course_xml;
}

async function makeTarFromFlatFile(f, path, template, makeDownloadLink){
    // Make an array and throw out blank lines.
    let textlines = f.split('\n').filter( (l) => l.trim().length > 0 );
    console.log('Making course tarball from...');
    console.log(textlines);


    let tar = new tarball.TarWriter();
    let filecounter = 0;

    template.forEach((temp_row) => {
        tar.addTextFile(temp_row.path, temp_row.text);
    });

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
                    if(row.slice(0,7) == 'course/'){
                        let newXML = makeNewCourseXML(template);
                        // console.log('new course_run.xml file')
                        // console.log(row);
                        // console.log(newXML);
                        tar.addTextFile(row, newXML);
                    }else{
                        // Sweet functionality note: folders are added automatically
                        // because the row text has the folder name and a slash.
                        tar.addFile(row, blob);
                    }
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
    target_location.append(download_placeholder);

    // Get the parts of the template that aren't boilerplate.
    let template = constructCourseTemplate();

    // Path to the boilerplate parts of the template.
    let boilerplate_structure_file = $('#filesource').val();
    let boilerplate_structure_path = boilerplate_structure_file.slice(0,-4)+'/';
    let course_tarball;


    // Get the flat file that describes the boilerplate course.
    let boilerplate_flat = await readCourseFlatFile(boilerplate_structure_file, async function(result){

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
        course_tarball = await makeTarFromFlatFile(result, boilerplate_structure_path, template, makeDownloadLink);

    });
}
