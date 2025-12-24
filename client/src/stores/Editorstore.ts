import {create }from 'zustand'
interface EditorStore{
    code:string;
    setCode:(newCode:string)=>void
}
export const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  setCode: (newCode) => set({ code: newCode }),
}));