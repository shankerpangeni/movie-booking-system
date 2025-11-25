"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { loadUser } from "./slices/authSlice";

function AuthInitializer({ children }) {
    useEffect(() => {
        // Load user on mount
        store.dispatch(loadUser());
    }, []);

    return <>{children}</>;
}

export function ReduxProvider({ children }) {
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}
