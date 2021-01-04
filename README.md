# edx_course_templater

This [web page](https://harvardx.github.io/edx_course_templater/index.html) generates edX course structures in a tarball file that can be immediately imported to EdX Studio. You fill out the form to describe your course, selecting things like the number of sections, whether they focus on video/text/problems, whether the first/last pages are different, etc. The course comes wrapped in a boilerplate course with standard intro and wrap-up materials.

As per usual, these will overwrite your existing course, so don't import them on top of a course where you've already done work. Instead, use this early in your process to save you the tedium of building out hundreds of blank components.

All of this runs client-side. No server is needed.

Pro Notes:

- Ready for use in production. Version 1.0.0
- We're using [TarballJS](https://github.com/ankitrohatgi/tarballjs) to make tar files, and [vkbeautify](https://github.com/vkiryukhin/vkBeautify) to pretty-print. Both are MIT-licensed. Snapshots of them are included in this repo.
- You can point this at your own boilerplate course if you want. You'll need an index file. Download and unzip your course, and run `find path/to/folder -type f > course_structure.txt` to create a flat file that describes the course structure. Here's [our boilerplate structure](https://github.com/HarvardX/edx_course_templater/blob/master/boilerplate_course.txt) if you want an example of what yours should look like.

Written by Colin Fredericks for HarvardX.
Last code update: November 20th, 2019.
Last update to boilerplate course: January 4th, 2021
