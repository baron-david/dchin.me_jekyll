---
layout: default
title: My Posts
permalink: /posts/
order: 100
---
![posts](/assests/images/IMG_1267.png)
<ol>
{% assign posts = site.posts | sort: "date" %}
{% for post in site.posts %}
    <li><a href="{{ post.url }}">{{ post.title}}</a>
    <span class="postDate">{{ post.date | date: "%b %-d, %Y" }}</span>
    </li>
{% endfor %}
</ol>