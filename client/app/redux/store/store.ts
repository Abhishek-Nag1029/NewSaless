import { configureStore } from '@reduxjs/toolkit'
import { loginApi } from '../api/loginApi'
import { adminApi } from '../api/AdminApi'
import authSlice from '../slice/authSlice'
import { employeeApi } from '../api/EmployeeApi'
import adminSlice from '../slice/adminSlice'
import empSlice from '../slice/empSlice'
import { candidateApi } from '../api/CandidateApi'
import candidateSlice from '../slice/candidateSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      [loginApi.reducerPath]: loginApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [employeeApi.reducerPath]: employeeApi.reducer,
      [candidateApi.reducerPath]: candidateApi.reducer,
      auth: authSlice,
      admin: adminSlice,
      employee: empSlice,
      candidate: candidateSlice
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(loginApi.middleware, adminApi.middleware, employeeApi.middleware, candidateApi.middleware)
  })

}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']