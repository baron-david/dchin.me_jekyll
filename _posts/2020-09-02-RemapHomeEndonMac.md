---
title: Home & End Keys on MBP
layout: default
---

# Remapping my Home & End Keys on my Macbook Pro

I have noticed using certain applications on my Macbook, such as inside webpage fields in Chrome, when I use the Home and End buttons on my 104-key keyboard the cursor does not go to the end of a line but instead goes to the top or bottom of a page.  This is very different than how my Windows behave.  

Luckily someone on the internet had a way to remap the keys on a Macbook.

[I borrowed this from this website...] (https://damieng.com/blog/2015/04/24/make-home-end-keys-behave-like-windows-on-mac-os-x)

1. Create this file
```
~/Library/KeyBindings/DefaultKeyBinding.dict
```

2. Contents of the file

```

{
  "\UF729"  = moveToBeginningOfParagraph:; // home
  "\UF72B"  = moveToEndOfParagraph:; // end
  "$\UF729" = moveToBeginningOfParagraphAndModifySelection:; // shift-home
  "$\UF72B" = moveToEndOfParagraphAndModifySelection:; // shift-end

  "^\UF729" = moveToBeginningOfDocument:; // ctrl-home
  "^\UF72B" = moveToEndOfDocument:; // ctrl-end
  "^$\UF729" = moveToBeginningOfDocumentAndModifySelection:; // ctrl-shift-home
  "^$\UF72B" = moveToEndOfDocumentAndModifySelection:; // ctrl-shift-end

  "^\UF702" = (moveWordLeft:); // ctrl-left
  "^$\UF702" = (moveWordLeftAndModifySelection:); // ctrl-shift-left 
  "^\UF703" = (moveWordRight:); // ctrl-right
  "^$\UF703" = (moveWordRightAndModifySelection:); // ctrl-shift-right
}

```

3. Reboot


