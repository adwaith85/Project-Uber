import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const UserStore = create(
    persist(
        (set) => ({
            token: null,
            user:null,
            adduser:(userdata)=>
                set((state)=>({
                    user:userdata,
                })),
            addToken: (item) =>
                set((state) => ({
                    token: item,
                })),
            removeToken: () =>
                set((state) => ({
                    token: null,
                })),
            logout:()=>
                set((state)=>({
                    token:null,
                    user:null,
                })),
        }),
        {
            name: "UserStore",
            storage: createJSONStorage(() => localStorage),
        }
    )
)


export default UserStore