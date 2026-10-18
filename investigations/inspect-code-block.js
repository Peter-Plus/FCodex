(()=>[...document.querySelectorAll('pre')].slice(0,6).map(e=>({html:e.parentElement.outerHTML.slice(0,10000)})))()
