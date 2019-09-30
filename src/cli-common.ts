export const DEFAULT_OUT_DIR = 'dist'

export interface BuildOptions {
	declaration?: boolean;
	format?: string;
	external?: string;
	plugins?: any[];
	name?: string;
	globals?: string;
	clean?: string;
	sourcemap?: boolean;
}
  
export interface BuildFormatOptions extends BuildOptions {
	pkgName?: string, 
	dependencies?: string[]
}	