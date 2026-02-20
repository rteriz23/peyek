function copySnippet(btn) {
    const code = btn.previousElementSibling.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="#27c93f" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    });
}
