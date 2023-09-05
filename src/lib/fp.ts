/*
 * This module is a sort of polyfill for fp-ts.
 */
export interface None {
  readonly _tag: 'None'
}

export interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

export type Option<A> = None | Some<A>;

export const isNone = (fa: Option<unknown>): fa is None => fa._tag === 'None';

export const isSome = <A>(fa: Option<A>): fa is Some<A> => fa._tag === 'Some';

export const none: Option<never> = { _tag : 'None' };

export const some = <A>(a: A): Option<A> => ({ _tag : 'Some', value : a });


// export const flatMap: {
//   <A, B>(f: (a: A) => Option<B>): (ma: Option<A>) => Option<B>
//   <A, B>(ma: Option<A>, f: (a: A) => Option<B>): Option<B>
// } = /*#__PURE__*/ dual(2, <A, B>(ma: Option<A>, f: (a: A) => Option<B>): Option<B> => (isNone(ma) ? none : f(ma.value)))


