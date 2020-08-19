---
title: My First Post
layout: default
---

This site was built using Jekyll(GitHub Template) served by Netlify and repo stored on GitHub.

Some images are served by IBM Cloud Storage.

## URLS:
* https://dchin.netlify.app/
* https://daveops.s3.us-south.cloud-object-storage.appdomain.cloud/sp-studio.jpg

![ibm cloud hosted image](https://daveops.s3.us-south.cloud-object-storage.appdomain.cloud/sp-studio.jpg)


<h3 id="header-3">Posts</h3>
<ol>
{% for post in site.posts %}
    <li><a href="{{ post.url }}">{{ post.title}}</a>
    <span class="postDate">{{ post.date | date: "%b %-d, %Y" }}</span>
    </li>
{% endfor %}
</ol>

[home](/)