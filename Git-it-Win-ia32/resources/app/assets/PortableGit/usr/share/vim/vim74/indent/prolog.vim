"  vim: set sw=4 sts=4:
"  Maintainer	: Gergely Kontra <kgergely@mcl.hu>
"  Revised on	: 2002.02.18. 23:34:05
"  Language	: Prolog

" TODO:
"   checking with respect to syntax highlighting
"   ignoring multiline comments
"   detecting multiline strings

" Only load this indent file when no other was loaded.
if exists("b:did_indent")
    finish
endif

let b:did_indent = 1

setlocal indentexpr=GetPrologIndent()
setlocal indentkeys-=:,0#
setlocal indentkeys+=0%,-,0;,>,0)

" Only define the function once.
"if exists("*GetPrologIndent")
"    finish
"endif

function! GetPrologIndent()
    " Find a non-blank line above the current line.
    let pnum = prevnonblank(v:lnum - 1)
    " Hit the start of the file, use zero indent.
    if pnum == 0
       return 0
    endif
    let line = getline(v:lnum)
    let pline = getline(pnum)

    let ind = indent(pnum)
    " Previous line was comment -> use previous line's indent
    if pline =~ '^\s*%'
	retu ind
    endif
    " Check for clause head on previous line
    if pline =~ ':-\s*\(%.*\)\?$'
	let ind = ind + &sw
    " Check for end of clause on previous line
    elseif pline =~ '\.\s*\(%.*\)\?$'
	let ind = ind - &sw
    endif
    " Check for opening conditional on previous line
    if pline =~ '^\s*\([(;]\|->\)'
	let ind = ind + &sw
    endif
    " Check for closing an unclosed paren, or middle ; or ->
    if line =~ '^\s*\([);]\|->\)'
	let ind = ind - &sw
    endif
    return ind
endfunction
