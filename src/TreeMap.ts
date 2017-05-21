import { TreeNode } from './TreeNode'

export class TreeMap<K,V> {
	protected root: TreeNode<K,V> = TreeNode.NIL
	
	constructor( array?: [K,V][] ) {
		if ( array ) {
			for ( const [k,v] of array ) {
				this.set( k, v )
			}
		}
	}

	static is( v: any ): boolean {
		return v instanceof TreeMap
	}

	static of<K,V>( ...args: [K,V][] ): TreeMap<K,V> {
		return new TreeMap<K,V>( args )
	}

	static ofObject<V>( ...objs: {[key: string]: V}[] ): TreeMap<string,V> {
		let map = new TreeMap<string,V>()
		for ( const obj of objs ) {
			for ( const k in obj ) {
				if ( obj.hasOwnProperty( k )) {
					map = map.set( k, obj[k] )
				}
			}
		}
		return map
	}

	protected static ofNode<K,V>( node: TreeNode<K,V> ): TreeMap<K,V> {
		const v = new TreeMap<K,V>()
		v.root = node
		return v
	}

	toObject(): {[key: string]: V} {
		const obj: {[key: string]: V} = {}
		this.forEach( (v, k) => { obj[k.toString()] = v } )
		return obj
	}

	set( k: K, v: V ): TreeMap<K,V> {
		return TreeMap.ofNode( this.root.set( k, v ))
	}

	update( k: K, updater: (value: V, key: K, map: TreeMap<K,V>) => V ): TreeMap<K,V> {
		return TreeMap.ofNode( this.root.set( k, updater( this.root.map.get( k ), k, this )))
	}

	get( k: K ): V | undefined {
		const node = this.root.getNode( k )
		return node.exists() ? node.v : undefined
	}

	has( k: K ): boolean {
		return !this.root.getNode( k ).exists()
	}
	
	delete( k: K ): TreeMap<K,V> {
		return TreeMap.ofNode( this.root.delete( k ))
	}

	forEach<Z>( callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => void, thisArg?: Z ): void {
		this.root.forEach( this, callbackFn, thisArg )
	}
	
	reduce<U>( callbackFn: (acc: U, value: V, key: K, map: TreeMap<K,V>) => U, initialValue: U ): U {
		return this.root.reduce<U>( this, callbackFn, initialValue )
	}

	reduceRight<U>( callbackFn: (acc: U, value: V, key: K, map: TreeMap<K,V>) => U, initialValue: U ): U {
		return this.root.reduceRight<U>( this, callbackFn, initialValue )
	}

	map<Z,U>( callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => U, thisArg?: Z ): TreeMap<K,U> {
		return TreeMap.ofNode( this.root.map<Z,U>( this, callbackFn, thisArg ))
	}

	filter<Z>( callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => boolean, thisArg?: Z ): TreeMap<K,V> {
		return TreeMap.ofNode( this.root.filter<Z>( this, callbackFn, thisArg ))
	}

	count<Z>( callbackFn: (this: Z, value: V, key: K, map: TreeMap<K,V>) => boolean, thisArg?: Z ): number {
		let n = 0
		this.forEach( (v,k) => { if( callbackFn.call( thisArg, v, k, this )) n++ } )
		return n
	}

	get size() {
		let n = 0
		this.forEach( () => { n++ } )
		return n
	}
	
	keys(): any {
		const keys: K[] = []
		this.forEach(( _: V, k: K ) => keys.push( k ))
		return keys
	}

	values(): V[] {
		const values: V[] = []
		this.forEach(( v: V, _: K ) => values.push( v ))
		return values
	}

	entries(): [K,V][] {
		const entries: [K,V][] = []
		this.forEach(( v: V, k: K ) => entries.push( [k,v] ))
		return entries
	}

	iterator() {
		return this.root.iterator()
	}
}

if ( typeof Symbol !== 'undefined' && typeof Symbol.iterator !== 'undefined' ){
	(<any>TreeMap).prototype[Symbol.iterator] = TreeMap.prototype.iterator
}
