import { TreeMap } from './TreeMap'

export class TreeNode<K,V> {
	static NIL: TreeNode<any,any> = ((): TreeNode<any,any> => { 
		const nil = new TreeNode<any,any>( undefined, undefined, (<any>undefined), (<any>undefined), 0 )
		nil.l = nil.r = nil
		return nil
	})()

	static DEL: any = {}

	constructor(
		public k: K,
		public v: V,
		public l: TreeNode<K,V>,
		public r: TreeNode<K,V>,
		public lvl: number ) {}
	
	exists(): boolean {
		return this !== TreeNode.NIL && this.v !== TreeNode.DEL
	}

	protected isNil(): boolean {
		return this === TreeNode.NIL
	}

	protected isDel(): boolean {
		return this.v === TreeNode.DEL
	}

	protected skew(): TreeNode<K,V> {
		if ( !this.isNil()) {
			const {k, v, l, r, lvl} = this
			const {k: lk, v: lv, l: ll, r: lr, lvl: llvl} = l
			if ( !l.isNil() && lvl === llvl ) {
				const rr = new TreeNode<K,V>( k, v, lr, r, lvl )
				return new TreeNode<K,V>( lk, lv, ll, rr, lvl )
			}
		}
		return this
	}

	protected split(): TreeNode<K,V> {
		if ( !this.isNil()) {
			const {k, v, l, r, lvl} = this
			if ( !r.isNil()) {
				const {k: rk, v: rv, l: rl, r: rr} = r
				const {lvl: rrlvl} = rr
				if ( !rr.isNil() && lvl === rrlvl ) {
					const ll = new TreeNode<K,V>( k, v, l, rl, lvl )
					return new TreeNode<K,V>( rk, rv, ll, rr, lvl + 1 )
				}
			}
		}
		return this
	}

	protected setRebalance(): TreeNode<K,V> {
		return this.split().skew()
	}

	getNode( key: K ): TreeNode<K,V> {
		if ( this.isNil() ) {
			return this
		} else {
			const {k, l, r} = this
			if ( key === k ) {
				return this
			} else if ( key < k ) {
				return l.getNode( key )
			} else {
				return r.getNode( key )
			}
		}
	}

	set( key: K, value: V ): TreeNode<K,V> {
		if ( this.isNil()) {
			if ( value === TreeNode.DEL ) {
				return TreeNode.NIL
			} else {
				return new TreeNode<K,V>( key, value, this, this, 1 )
			}	
		} else {
			const {k, v, l, r, lvl} = this
			if ( key === k ) {
				return new TreeNode<K,V>( key, value, l, r, lvl )
			} else if ( key < k ) {
				return new TreeNode<K,V>( k, v, l.set( key, value ), r, lvl ).setRebalance()
			} else {
				return new TreeNode<K,V>( k, v, l, r.set( key, value ), lvl ).setRebalance()
			}
		}
	}

	delete( key: K ): TreeNode<K,V> {
		return this.set( key, TreeNode.DEL )
	}

	iterator(): IterableIterator<[K,V]> {
		const root: TreeNode<K,V> = this
		const gen = function*() {
			const stack: TreeNode<K,V>[] = root.isNil() ? [] : [ root ]
			for ( let node = stack.pop(); node !== undefined; node = stack.pop()){
				const {k, v, l, r} = node
				if ( !l.isNil() ) stack.push( l )
				if ( !r.isNil() ) stack.push( r )
				if ( !node.isDel() ) yield (<[K,V]>[k,v])
			}
		}
		return gen()
	}

	forEach<Z>( map: TreeMap<K,V>, callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => void, thisArg?: Z ): void {
		const stack: TreeNode<K,V>[] = this.isNil() ? [] : [ this ]
		for ( let node = stack.pop(); node !== undefined; node = stack.pop()){
			const {k, v, l, r} = node
			if ( !l.isNil() ) stack.push( l )
			if ( !r.isNil() ) stack.push( r )
			if ( !node.isDel() ) callbackFn.call( thisArg, v, k, map )
		}
	}

	reduce<U>( map: TreeMap<K,V>, callbackFn: (acc: U, value: V, key: K, map: TreeMap<K,V>) => U, initialValue: U ): U {
		if ( this.isNil()) {
			return initialValue
		} else {
			const {k, v, l, r} = this
			const leftFold = l.reduce<U>( map, callbackFn, initialValue )
			return r.reduce<U>( map, callbackFn, this.isDel() ? initialValue : callbackFn( leftFold, v, k, map ))
		}
	}

	reduceRight<U>( map: TreeMap<K,V>, callbackFn: (acc: U, value: V, key: K, map: TreeMap<K,V>) => U, initialValue: U ): U {
		if ( this.isNil()) {
			return initialValue
		} else {
			const {k, v, l, r} = this
			const rightFold = r.reduceRight<U>( map, callbackFn, initialValue )
			return l.reduceRight<U>( map, callbackFn, this.isDel() ? initialValue : callbackFn( rightFold, v, k, map ))
		}
	}
	
	map<Z,U>( map: TreeMap<K,V>, callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => U, thisArg?: Z ): TreeNode<K,U> {
		if ( this.isNil()) {
			return TreeNode.NIL
		} else {
			const {k, v, l, r, lvl} = this
			return new TreeNode<K,U>( k, v === TreeNode.DEL ? TreeNode.DEL : callbackFn.call( thisArg, k, v, map ), l.map( map, callbackFn, thisArg ), r.map( map, callbackFn, thisArg ), lvl )
		}
	}

	filter<Z>( map: TreeMap<K,V>, callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => boolean, thisArg?: Z ): TreeNode<K,V> {
		let result = TreeNode.NIL
		this.forEach<Z>( map, ( v: V, k: K, map: TreeMap<K,V> ): void => {
			if ( v !== TreeNode.DEL && callbackFn.call( thisArg, v, k, map )) {
				result = result.set( k, v )
			}
		}, thisArg )
		return result
	}
}
