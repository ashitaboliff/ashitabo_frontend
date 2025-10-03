// types/global.d.ts
import 'next-auth'

declare global {
	type Session = import('next-auth').Session
}

export {}
