<header>

<!--
  <<< Author notes: Course header >>>
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses MIT license.
-->

# AndyBevan - GitHub Pages

This is the source repo for [andybevan.github.io](https://andybevan.github.io/)

## Local development

To preview styling changes locally:

1. Install Ruby and Bundler.
2. Run `bundle install`.
3. Start the site with `bundle exec jekyll serve`.
4. Open `http://127.0.0.1:4000`.

If you want Jekyll to rebuild automatically while you edit styles, keep the server running and refresh the browser after each change.

Alternatively, you can use Docker so the Ruby/Bundler toolchain runs inside a container while your source files stay on the host:

1. Install Docker Desktop and ensure the daemon is running.
2. Run `docker compose up`.
3. Open `http://127.0.0.1:4000`.

The compose service mounts the repo into the container, runs `bundle install` inside the image, and starts `bundle exec jekyll serve --host 0.0.0.0`, so edits on your host are reflected immediately in the browser.
</header>

<!--
  <<< Author notes: Finish >>>
  Review what we learned, ask for feedback, provide next steps.


## Finish

_Congratulations friend, you've completed this course!_

<img src=https://octodex.github.com/images/constructocat2.jpg alt=celebrate width=300 align=right>

Your blog is now live and has been deployed!

Here's a recap of all the tasks you've accomplished in your repository:

- You enabled GitHub Pages.
- You selected a theme using the config file.
- You learned about proper directory format and file naming conventions in Jekyll.
- You created your first blog post with Jekyll!

### What's next?

- Keep working on your GitHub Pages site... we love seeing what you come up with!
- We'd love to hear what you thought of this course [in our discussion board](https://github.com/orgs/skills/discussions/categories/github-pages).
- [Take another GitHub Skills course](https://github.com/skills).
- [Read the GitHub Getting Started docs](https://docs.github.com/en/get-started).
- To find projects to contribute to, check out [GitHub Explore](https://github.com/explore).

<footer>
-->
<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->
<!--
---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/github-pages) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
-->
