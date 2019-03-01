"use strict";

console.log('working');

$(document).ready(function(){

    // Don't submit the form when someone hits "enter".
    $("form").keypress(function(e) {
      // Enter key is 13.
      if (e.which == 13) {
        return false;
      }
    });

    // Visibility toggle for headers and footers.
    $('.headfoot').on('change', function(){
        $(this).siblings('div:first-of-type').slideToggle();
    });

    // About box slide
    $('#showabout').on('click tap', function(){
        if($(this).attr('aria-expanded') === 'false'){
            $(this).attr('aria-expanded','true');
            $(this).text('Righty-o.');
            $('#abouttext').attr('aria-hidden','false');
            $('#abouttext').show();
        }else{
            $(this).attr('aria-expanded','false');
            $('#abouttext').attr('aria-hidden','true');
            $('#abouttext').hide();
            $(this).text('Wot\'s this then?');
        }
    });

    // When the page loads, or when anything changes,
    // build the template by which we make the tarball.
    constructCourseTemplate();
    $('input').on('change', function(e){
        // console.log(e);
        console.log(constructCourseTemplate());
    });

    // Interface niceness for greyed-out options
    $('input[name="corecontent"]').on('change', function(){
        let whichoption = $('input[name="corecontent"]:checked').val();
        $('#numprob').addClass('disabled');
        $('#whatcustom').addClass('disabled');
        if(whichoption === 'special'){
            $('#whatcustom').removeClass('disabled');
        }else if(whichoption === 'problem'){
            $('#numprob').removeClass('disabled');
        }
    });
    $('#whatcustom').on('focus', function(){
        $('#usespec').click();
    });
    $('#numprob').on('focus', function(){
        $('#useprob').click();
    });

    // Copying terms for s, ss, u across the page
    ['section','subsection','unit'].forEach(function(t){
        $('#' + t + 'name').on('input', function(){
            $('.' + t + 'text').text($(this).val().toLowerCase());
        })
    });

});

// Makes the pair of files you need for HTML in edX.
// The "filename" here should have .xml at the end.
function makeHTMLFilePair(filename){
    return [
        {
            'path': 'html/' + filename,
            'text': '<html display_name="Text/HTML" filename="' + filename.slice(0,-4) + '" />'
        },
        {
            'path': 'html/' + filename.slice(0,-3)+'html',
            'text': ''
        }
    ];
}


// add content page tags
function makeContentPageTags(name, tag, num_elem){
    let temp = [];
    let innards = '';

    for(let n = 0; n < num_elem; n++){
        let filename = name + '_' + tag + '_' + (n+1) + '.xml';
        innards += '<' + tag + ' url_name="' + filename.slice(0,-4) + '" />\n';
        if(tag === 'html'){
            temp.push(...makeHTMLFilePair(filename));
        }else{
            temp.push({
                'path': tag + '/' + filename,
                'text': '<' + tag +' display_name="' + tag + '">\n</' + tag + '>'
            });
        }
    }
    return {'array': temp, 'innards': innards};
}


// Make the core of a subsection
function makeSequentialCore(s, ss, num_pages, coreTag, num_core_components, u_name){
    let temp = [];
    let innards = '';
    let prob_on_every_page = $('#poep')[0].checked;
    let disc_on_every_page = $('#doep')[0].checked;
    let disc_has_intro = $('#dhti')[0].checked;
    let vid_has_intro = $('#vhti')[0].checked;

    for(let p = 0; p < num_pages; p++){
        let vertical_innards = '';

        if(vid_has_intro){
            if(coreTag == 'video'){
                let vhti_file = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) + '_vidintro.xml';
                vertical_innards += '<html url_name="' + vhti_file.slice(0,-4) + '" />\n';
                temp.push(...makeHTMLFilePair(vhti_file));
            }
        }

        // add content page tags
        let c_name = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_' + (p+1) ;
        let c_tags = makeContentPageTags(c_name, coreTag, num_core_components);
        temp.push(...c_tags.array);
        vertical_innards += c_tags.innards;

        if(prob_on_every_page){
            let poep_file = c_name + '_problem_x.xml';
            vertical_innards += '<problem url_name="' + poep_file.slice(0,-4) + '" />\n';
            temp.push({
                'path': 'problem/' + poep_file,
                'text': '<problem display_name="Problem">\n</problem>'
            });

        }

        if(disc_on_every_page){
            if(disc_has_intro){
                let dhti_file = c_name + '_discintro.xml';
                vertical_innards += '<html url_name="' + dhti_file.slice(0,-4) + '" />\n';
                temp.push(...makeHTMLFilePair(dhti_file));
            }
            let doep_file = c_name + '_problem_x.xml';
            vertical_innards += '<discussion url_name="' + doep_file.slice(0,-4) + '" xblock-family="xblock.v1" discussion_category="Chapter ' + (s+1) + '" />\n'
            // no need to add to template, only declared inline.
        }

        // add vertical tag to template
        let vert_file = c_name + '.xml';
        temp.push({
            'path': 'vertical/' + vert_file,
            'text': '<vertical display_name="' + u_name + ' ' + (p+1) + '" >\n' + vertical_innards + '</vertical>'
        });
        innards += '  <vertical url_name="' + vert_file.slice(0,-4) + '" />\n';
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

    let s_name = $('#sectionname').val();
    let ss_name = $('#subsectionname').val();
    let u_name = $('#unitname').val();

    // Core part of the page - is it a video page, a text page, etc.
    let coreTag = $('input[name="corecontent"]:checked').val();
    if( coreTag === 'special' ){ coreTag = $('#whatcustom').val(); }

    let num_core_components = 1;
    if(coreTag === 'problem'){
        num_core_components = Number($('#numprob').val());
    }

    let subsHaveHeaders = $('#headerpage')[0].checked;
    let subsHaveFooters = $('#footerpage')[0].checked;
    let sectsHaveHeaders = $('#headerss')[0].checked;
    let sectsHaveFooters = $('#footerss')[0].checked;
    let use_hxjs = $('#hxjs')[0].checked;

    for(let s = 0; s < sections; s++){
        let chapter_innards = '';

        if(sectsHaveHeaders){
            // Not currently making header/footer sections for headers/footers.
            let head_pages = $('#numheadpages').val();
            let s_head_tag = $('input[name="ssheaders"]:checked').val();
            if( s_head_tag === 'special' ){ s_head_tag = $('#whatcustom').val(); }
            let num_head_components = (s_head_tag === 'problem') ? Number($('#numshprob').val()) : 1;

            let sect_head = makeSequentialCore(s, 'intro', head_pages, s_head_tag, num_head_components, u_name);
            let sequential_innards = sect_head.innards;
            template.push(...sect_head.array);

            // add sequential tag to template
            let seq_file = 's_' + (s+1) + '_ss_head.xml';
            template.push({
                'path': 'sequential/' + seq_file,
                'text': '<sequential display_name="Intro ' + ss_name + '">\n' + sequential_innards + '</sequential>'
            });
            chapter_innards += '  <sequential url_name="' + seq_file.slice(0,-4) + '" />\n';
        }

        for(let ss = 0; ss < subsections; ss++){
            let sequential_innards = '';

            // add tags for subsection header page
            if(subsHaveHeaders){
                let head_tag = $('input[name="unitheaders"]:checked').val();
                // console.log(head_tag);
                if( head_tag === 'special' ){ head_tag = $('#whatcustomhead').val(); }
                let num_head_elements = (head_tag === 'problem') ? Number($('#numsshprob').val()) : 1;
                let h_name = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_head';
                let h_tags = makeContentPageTags(h_name, head_tag, num_head_elements);

                template.push(...h_tags.array);

                template.push({
                    'path': 'vertical/' + h_name + '.xml',
                    'text': '<vertical display_name="' + u_name + ' ' + (ss+1) + ' intro">\n' + h_tags.innards + '</vertical>'
                });
                sequential_innards += '  <vertical url_name="' + h_name + '" />\n';

            }

            // Build the core pages of the sequence.
            let ss_core = makeSequentialCore(s, ss, pages, coreTag, num_core_components, u_name);
            sequential_innards += ss_core.innards;
            template.push(...ss_core.array);

            // add tags for subsection footer page
            if(subsHaveFooters){
                let foot_tag = $('input[name="unitfooters"]:checked').val();
                // console.log(foot_tag);
                if( foot_tag === 'special' ){ foot_tag = $('#whatcustomfoot').val(); }
                let num_foot_elements = (foot_tag === 'problem') ? Number($('#numssfprob').val()) : 1;
                let f_name = 's_' + (s+1) + '_ss_' + (ss+1) + '_p_foot';
                let f_tags = makeContentPageTags(f_name, foot_tag, num_foot_elements);

                template.push(...f_tags.array);

                template.push({
                    'path': 'vertical/' + f_name + '.xml',
                    'text': '<vertical display_name="' + u_name + ' ' + (ss+1) + ' outro">\n' + f_tags.innards + '</vertical>'
                });
                sequential_innards += '  <vertical url_name="' + f_name + '" />\n';

            }

            // add sequential tag to template
            let seq_file = 's_' + (s+1) + '_ss_' + (ss+1) + '.xml';
            template.push({
                'path': 'sequential/' + seq_file,
                'text': '<sequential display_name="' + ss_name + ' ' + (ss+1) + '">\n' + sequential_innards + '</sequential>'
            });
            chapter_innards += '  <sequential url_name="' + seq_file.slice(0,-4) + '" />\n';
        }

        if(sectsHaveFooters){
            // Not currently making header/footer sections for headers/footers.
            // Not currently making header/footer sections for headers/footers.
            let foot_pages = $('#numfootpages').val();
            let s_foot_tag = $('input[name="ssfooters"]:checked').val();
            if( s_foot_tag === 'special' ){ s_foot_tag = $('#whatcustom').val(); }
            let num_foot_components = (s_foot_tag === 'problem') ? Number($('#numsfprob').val()) : 1;

            let sect_foot = makeSequentialCore(s, 'intro', foot_pages, s_foot_tag, num_foot_components, u_name);
            let sequential_innards = sect_foot.innards;
            template.push(...sect_foot.array);

            // add sequential tag to template
            let seq_file = 's_' + (s+1) + '_ss_foot.xml';
            template.push({
                'path': 'sequential/' + seq_file,
                'text': '<sequential display_name="Outro ' + ss_name + '">\n' + sequential_innards + '</sequential>'
            });
            chapter_innards += '  <sequential url_name="' + seq_file.slice(0,-4) + '" />\n';

        }

        // add chapter tag to template
        template.push({
            'path': 'chapter/s_' + (s+1) + '.xml',
            'text': '<chapter display_name="' + s_name + ' ' + (s+1) + '">\n' + chapter_innards + '</chapter>'
        });

    }

    // Syllabus and related are currently automatically included.
    let policies = {
        // 'syllabus': $('#syllabus')[0].checked,
        // 'related': $('#related')[0].checked,
        'calendar': $('#calendar')[0].checked,
        'FAQ': $('#faq')[0].checked,
        'glossary': $('#glossary')[0].checked,
        'resources': $('#resources')[0].checked,
        'outline': $('#outline')[0].checked
    };

    Object.keys(policies).forEach(k => {
        if(policies[k]){
            template.push({
                'path': 'tabs/' + k.charAt(0).toUpperCase() + k.slice(1),
                'text': '<h3>' + + k.charAt(0).toUpperCase() + k.slice(1) + ' placeholder</h3>'
            });
        }
    });

    // Add HX-JS to first HTML component on every page.
    if(use_hxjs){
        let hxjscode = '<script src="/static/hx.js"></script>\n<link rel="stylesheet" type="text/css" href="/static/hx.css">';

        // Get the locations of all the first HTML elements
        let all_verticals = template.filter(e => e.path.startsWith('vertical'));
        let expanded_tags = all_verticals.map( v => v.text.split('\n') );
        let first_html = expanded_tags.map(t => t.filter( r => r.indexOf('html') > -1 )[0] );
        let html_urls = first_html.reduce((result,e) => {
            if(e){
                result.push($.parseXML(e).children[0].attributes.url_name.value);
            }
            return result;
        }, []);
        // console.log(html_urls);

        // Add HX-JS to the start of each of them.
        template.forEach(function(e){
            html_urls.forEach(function(h){
                if(e.path == 'html/' + h + '.html'){
                    e.text = hxjscode + e.text;
                }
            });
        });

    }

    return {'template': template, 'policies': policies};
}


// Reads files from the boilerplate course and returns the raw text.
function readCourseFile(filepath, callback){
    console.log('reading file ' + filepath);

    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("text/plain");
    rawFile.onreadystatechange = function() {
        console.log(rawFile.readyState, rawFile.status);
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            // console.log('file:');
            console.log(rawFile.responseText);
            callback(rawFile.responseText);
        }else if(rawFile.readyState === 4 && rawFile.status != "200"){
            // We didn't load the file. Use a blank course instead.
            callback(false);
        }
    }
    rawFile.open("GET", filepath, true);
    rawFile.send(null);

}


// Returns raw, prettified text for revised policies/(run)/policy.json file.
async function makeNewCoursePolicy(policies, path, run, new_course_info, callback){

    // console.log(policies);

    let policy_file = await readCourseFile(path + 'policies/' + run + '/policy.json', async function(j){
        if(!j){ console.log('No policy file found.'); }
        j = JSON.parse(j);
        let cid = 'course/' + new_course_info.run;
        // console.log(j);
        // Duplicate the existing run info for the new run.
        j[cid] = JSON.parse(JSON.stringify(j['course/' + run]));
        // Set course name
        j[cid].display_name = $('#coursename').val();
        // Set up the tabs
        Object.keys(policies).forEach(tab => {
            if(policies[tab]){
                j[cid].tabs.push({
                    'course_staff_only': false,
                    'name': tab.charAt(0).toUpperCase() + tab.slice(1),
                    'type': 'static_tab',
                    'url_slug': tab
                });
            }
        });

        // console.log(j);
        callback(JSON.stringify(j, null, 2));
    });

}


// Returns raw, prettified text for revised course/(run).xml file.
async function makeNewCourseXML(template, path, run, new_course_info, callback){

    // console.log(template);

    let new_chapters = template.filter(function(row){
        return row.path.slice(0,7) === 'chapter';
    });

    // console.log(new_chapters);

    let course_xml = await readCourseFile(path + 'course/' + run + '.xml', async function(coursefile){
        if(!coursefile){ console.log('No course_run.xml file found.'); }
        let course = $(coursefile);
        course.attr('display_name', new_course_info.name);

        // Swap out the old wiki slug for a new one.
        let new_slug = new_course_info.org + '.' + new_course_info.number + '.' + new_course_info.run;
        course.find('wiki').replaceWith('<wiki slug="' + new_slug + '"/>');

        for(let i = 0; i < new_chapters.length; i++){
            // Cutting off chapter/ and .xml from paths.
            let newtag = $('<chapter url_name="' + new_chapters[i].path.slice(8,-4) + '" />');
            // Insert new chapters after the first chapter in the boilerplate.
            course.find('chapter:nth-child(' + (i+1) + ')').after(newtag);
        }
        // console.log(course);
        callback({
            'new': vkbeautify.xml(course[0].outerHTML, 2),
            'old': coursefile
        });
    });

}


// Composits the template and boilerplate into a combined course.
async function makeTarFromFlatFile(f, path, template, policies, run, makeDownloadLink){
    // Make an array from the flat file and throw out blank lines.
    let textlines = f.split('\n').filter( (l) => l.trim().length > 0 );
    console.log('Making course tarball from...');
    console.log(textlines);

    let tar = new tarball.TarWriter();
    let filecounter = 0;
    let new_course_info = {
        'name': $('#coursename').val(),
        'run': $('#courserun').val(),
        'org': $('#courseorg').val(),
        'number': $('#coursenum').val()
    }

    // Are we done adding files?
    function incrementAndCheckStatus(num_files){
        num_files += 1;
        if(num_files == textlines.length){
            console.log('tar complete');
            makeDownloadLink(tar);
        }else{
            return num_files;
        }
    }

    // Make files for all the items in our template.
    template.forEach((temp_row) => {
        tar.addTextFile(temp_row.path, temp_row.text);
    });

    // Now add in the boilerplate files.
    textlines.forEach(async function(row){

        // console.log(row);

        // Taking off the ./ from start of each. Artifact of using "find" command.
        if(row.slice(0,2) == './'){
            row = row.slice(2);
        }

        // Ignore invisible files.
        if(row[0] == '.') {
            filecounter = incrementAndCheckStatus(filecounter);
        }else{
            // Add the files as you get them.
            let thefile = await fetch(path + row)
                .then(res => res.blob())
                .then(blob => {
                    // console.log('blob obtained');
                    // console.log(blob);
                    let new_row = row.replace(run, new_course_info.run);
                    if(row.startsWith('course/')){
                        let course = makeNewCourseXML(template, path, run, new_course_info, function(course){
                            // console.log('new course/(run).xml file')
                            // console.log(row);
                            // console.log(xml);

                            // Old course run keeps old XML.
                            tar.addTextFile(row, course.old);
                            tar.addTextFile(new_row, course.new);
                            filecounter = incrementAndCheckStatus(filecounter);
                        });
                    }else if(row.startsWith('course.xml')){
                        // Write course file that points to new run.
                        tar.addTextFile('course.xml',
                            '<course url_name="' + new_course_info.run
                                + '" org="' + new_course_info.org
                                + '" course="' + new_course_info.number
                                + '"/>');
                        filecounter = incrementAndCheckStatus(filecounter);
                    }else if(row.startsWith('policies/' + run + '/grading_policy.json')){
                        // Copy old grading policy into both runs.
                        tar.addFile(row, blob);
                        tar.addFile(new_row, blob);
                        filecounter = incrementAndCheckStatus(filecounter);
                    }else if(row.startsWith('policies/' + run + '/policy.json')){
                        let newJSON = makeNewCoursePolicy(policies, path, run, new_course_info, function(j){
                            // console.log('new policies/(run)/json.xml file')
                            // console.log(row);
                            // console.log(JSON.parse(j));
                            // Copy new policy.json into both runs.
                            tar.addTextFile(row, j);
                            tar.addTextFile(new_row, j);
                            filecounter = incrementAndCheckStatus(filecounter);
                        });
                    }
                    else{
                        // Sweet functionality note: folders are added automatically
                        // because the row text has the folder name and a slash.
                        tar.addFile(row, blob);
                        filecounter = incrementAndCheckStatus(filecounter);
                    }
            });
        }

    });

}


// This is our "main" that gets called by the submit button
async function makeDownload() {

    // Insert placeholder text while we wait for things to tar up.
    let target_location = $('#dlink');
    let download_placeholder = $('<p>Creating tar file...</p>');
    let filename = $('#filename').val();
    target_location.append(download_placeholder);

    // Get the parts of the template that aren't boilerplate.
    let new_course = constructCourseTemplate()
    let template = new_course.template;
    let policies = new_course.policies;

    // Path to the boilerplate parts of the template.
    let boilerplate_structure_repo = $('#sourcerepo').val();
    let boilerplate_structure_file = boilerplate_structure_repo + $('#sourcefile').val();
    let boilerplate_structure_path = boilerplate_structure_file.slice(0,-4)+'/';
    let course_tarball;

    let course_run = await readCourseFile(boilerplate_structure_path + 'course.xml', async function(coursefile){
        if(!coursefile){ console.log('No course.xml file found.'); }
        let run = $(coursefile).attr('url_name');
        // console.log(run);

        // Get the flat file that describes the boilerplate course.
        let boilerplate_flat = await readCourseFile(boilerplate_structure_file, async function(result){

            if(!result){
                console.log('No flat file found. Using default blank course.');
                result = './course/course.xml\n./course_structure.txt\n./about/overview.html\n./policies/course/policy.json\n./policies/course/grading_policy.json\n./policies/assets.json\n./course.xml\n./assets/assets.xml\n';
            }

            // console.log('course structure:');
            // console.log(result);

            // Take the tar and make a download link with it.
            function makeDownloadLink(tar){
                let written = tar.write()
                    .then( (tarblob) => {
                        // console.log('tar written');
                        // console.log(tarblob);

                        // Remove the placeholder and put in the download link.
                        // The tar file is inserted as a Data URI.
                        let download_link = $('<a>Click to download archive</a>');
                        download_placeholder.remove();
                        download_link.attr('href', URL.createObjectURL(tarblob) );
                        download_link.attr('download', filename);
                        target_location.append(download_link);
                });
            }

            // Construct a tarball from the flat file.
            course_tarball = await makeTarFromFlatFile(result, boilerplate_structure_path, template, policies, run, makeDownloadLink);

        });

    });

}
