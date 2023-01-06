
let getSiblings = n => [...n.parentElement.children].filter(c=>c!=n)
function removeElementExcept(survivor) {
    if (!survivor) return;
    const parent = survivor.parentElement;
    if (survivor === document || !parent) return;
    const siblings = getSiblings(survivor);
    for (const sibling of siblings) {
    if (sibling.tagName === 'HEAD') continue;
    sibling.remove();
    }
    removeElementExcept(parent);
}
const playerElement = document.getElementsByClassName('watching_player-area')[0];
removeElementExcept(playerElement);
//document.getElementById("overlay-center").remove();
