// export function menuIcon() {
    
    var navLinksEl = document.querySelector('#nav-links');
    var menuBarEl = document.querySelector('#menu-bar');
    var timesBarEl = document.querySelector('#times-bar');
    
    menuBarEl.addEventListener('click', () => {
        showMenu(); 
    });
    
    timesBarEl.addEventListener('click', () => { 
        hideMenu();
    });
    
    function showMenu(){
        navLinksEl.style.right = '0'
        navLinksEl.style.display = 'block';
        // navLinksEl.style.transition = '1s'
    };
    
    function hideMenu(){
        navLinksEl.style.right = '-200px';
    }


// menuIcon();
