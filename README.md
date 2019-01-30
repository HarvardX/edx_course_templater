# edx_course_templater

Ok, so here's the plan:

* Make a survey using an HTML form.
* Have people fill it out to describe the kind of course they want to make.
* Use javascript to get the detail from it and construct the desired course.
    * Slap the boilerplate course in there too while we're at it.
    * And pre-set the gating workaround.
* Tar up the final file so they can download it. (Turns out no need to gzip.)
* Do this all client-side so we don't need to run a secure server.
* Run this out of GitHub Pages, maybe get a custom URL to point at it.

Currently using [TarballJS](https://github.com/ankitrohatgi/tarballjs), a snapshot of which is included in this repo. Creation of tarball from boilerplate is now working!

Originally I was going to use a JSON file to keep track of the boilerplate course, but honestly it's overkill. Using `find path/to/folder -type f > course_structure.txt` makes a flat file that will work just fine.

Current plan for template:
* Keep a few template files lying around.
* Load in the course/(run_id).xml file, and edit it to add the right number of template chapters.
    * Use meaningful filenames and iteration rather than randomization.
    * For instance, instead of fa79dc97acb75acbf97df.xml, use chap_1.xml, chap_1_ss_3.xml, and chap_1_ss_3_unit_3.xml
* Do similar stuff with the template sequentials and verticals.
* Add those edited files to the tarball, possibly using addTextFile to make things simpler for me.
