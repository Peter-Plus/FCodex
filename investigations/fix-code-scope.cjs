const fs=require('fs');const p='src/base-theme.css';let s=fs.readFileSync(p,'utf8');s=s.replace('code:not(pre code){','code:not(pre code):not([data-code-block] code){');fs.writeFileSync(p,s);
