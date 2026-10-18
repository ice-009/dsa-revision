// Tiny toast bus. toast('Saved') or toast('Solved', { label: 'Undo', run: fn }). <Toaster/> renders it.
let listener = null;
export const onToast = fn => { listener = fn; return () => { if (listener === fn) listener = null; }; };
export function toast(msg, action) { listener?.({ msg, action, id: Date.now() + Math.random() }); }
window.appToast = toast;
