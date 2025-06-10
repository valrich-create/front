import {HttpInterceptorFn} from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
	// Ne pas modifier les requêtes externes
	if (req.url.startsWith('http')) {
		return next(req);
	}

	// En production : ajouter le préfixe complet
	if (environment.production) {
		const newUrl = environment.apiUrl + req.url.replace('/api', '/v1');
		req = req.clone({ url: newUrl });
	}

	return next(req);
};