# Overview

The parser will dump all markdown contents as a JSON object with this structure

```txt
{
    "language" : <string of language name>,
    "blogs" : [
        {
            "title" : <string of blog title>,
            "html" : [ <HTMLElement...> ]
        }
    ]
}
```

## Object Structres

Each HTMLElement will be mapped to the following object structure.

### Heading

```txt
{
    "type" : "Header",
    "level" : <number>,
    "content" : <string of header value>
}
```

### Paragraph

```
{
    "type" : "Paragraph",
    "lines" : [<string of content where trailing "  " has been stripped>]
}
```

### Ordered List

```
{
    "type" : "OrderedList",
    "list" : [<string of list items where index has been stripped>]
}
```

### Unordered List

```
{
    "type" : "UnorderedList",
    "list" : [<string of list items where leading "- " has been stripped>]
}
```

### Code Block

```
{
    "type" : "Code",
    "language" : <string of language suffix - can be empty>,
    "code" : [<string of code lines>]
}
```

### Table

```
{
    "type": "Table",
    "headers": [<string of header columns>],
    "rows": [[<string of columns>]],
}
```
