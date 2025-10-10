import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const UserStore = create(
    persist(
        (set) => ({
            token: null,
            addToken: (item) =>
                set((state) => ({
                    token: item,
                })),
            removeToken: () =>
                set((state) => ({
                    token: null,
                })),
        }),
        {
            name: "UserStore",
            storage: createJSONStorage(() => localStorage),
        }
    )
)


export default UserStore