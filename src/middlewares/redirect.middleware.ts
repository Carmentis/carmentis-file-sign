import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RewriteRootToSendMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Check if the request is for '/'
        if (req.path === '/') {
            // Preserve the query parameters
            const queryParams = req.url.split('?')[1] || '';
            // Redirect to /send with the preserved query parameters
            req.url = '/send' + (queryParams ? '?' + queryParams : '');
        }

        // Pass the modified request to the next middleware or controller
        next();
    }
}
