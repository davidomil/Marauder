# Marauder

**Marauder** is simple, yet powerful **Electron** app. It contains only single page, which can be completely configured through external json configuration file.

## Features
- set background
- set global css
- add and position multiple buttons/elements
- set hover in and hover out event handlers
- detect click and execute external app/open file in default editor

## Sample configuration file

```
{
```

Lets start with setting the background. The background is set to **cover** and  **no-repeat** by default.
```
    "background": "config/img/background.png",
```
The path is always relative to working directory.

Now continue with setting global css. We set **font-weight** to **bold**, **font-size** to **30px** and **font-family** to **Arial**.

```
"css": {
        "font-weight": "bold",
        "font-size": "30px",
        "font-family": "Arial"
    },
```

Now the fun part comes. Adding elements.

```
"elements": [
```
First one is going to be **"First Element"**
```
{
        "printName": "First Element",
```
Now give it some css, **50px** from top and left
```
"css": {
            "top": "50px",
            "left": "50px"
        },
```
and set what happens on **hoverIn**
```
"hoverIn": {
```
We have two options, we can either change css, execute js or both. This time we only set **opacity** to **0.4**.
```
"js": [],
"css": {
        "opacity": "0.4"
        }
}
```
since js is empty, we can remove it, but I'll keep it there just in case.
Now do the same thing for **hoverOut**, but this time return the **opacity** back to **1**.
```
"hoverOut": {
    "js": [],
    "css": {
            "opacity": "1"
            }
},
```
We are almost done with the first element. Lets finish by adding what happens after **click**. 
```
"click": {
        "js": [
            "alert('clicked')"
        ],
        "css": {},
    
```
Js and css functionality is the same as in **hoverIn** and **Out**. We don't change any css this time, but we want to call **alert** informing us of the event.
Now we want it to run an app. In this case we want it to run **chrome** in an **incognito mode**.
```
"externalApp": {
            "appUrl": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            "appParam": ["--incognito"]
        },
```
 The **appURL** is **absolute path** to the file and **appParam** is the an **array of parameters**. 
 One more thing we are going to do is to also open an png file in **default system viewer**. For that we use the **externalFile**.
```
 "externalFile": [
            "/config/img/background.png"
        ]
```
It checks if the path exists as **absolute**, if not, it takes it **relative** to working folder.
Close brackets :D
```
        }
    ]
}
```

### Final config.json should look like this:

```
{
    "background": "config/img/background.png", 
    "css": {
        "font-weight": "bold",
        "font-size": "30px",
        "font-family": "Arial"
    },
    "elements": [{
        "printName": "First Element",
        "css": {
            "top": "50px",
            "left": "50px"
        },
        "click": {
            "externalApp": {
                "appUrl": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                "appParam": ["--incognito"]
            },
            "externalFile": [
                "/config/img/background.png"
            ]
            ,
            "js": [
                "alert('clicked')"
            ],
            "css": {
            }
        },
        "hoverIn": {
            "js": [],
            "css": {
                "opacity": "0.4"
            }
        },
        "hoverOut": {
            "js": [],
            "css": {
                "opacity": "1"
            }
        }
    }]
}
```

## Shortcuts

| Key | -- |
| --| -- |
|Alt| Show Menu|
|Ctrl+Q| Quit|
| **Only in development:** |
| Ctrl+I | Open developer tools |
| Ctrl+R | Reload configuration |


## Notes
- background is set to default div **#container**
- global css also applies to the container
- If the whole background is dynamically changing it is possible to see some flickering. Easy fix is to blend the background by setting css to:
``` "transition":"background-image 0.4s ease-in-out" ```

## TODO LIST
- [ ] allow external parts of configuration file
- [ ] add ability to set classes for buttons