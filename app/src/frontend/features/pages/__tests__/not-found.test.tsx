import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, Route, Switch } from 'react-router-dom';
import { NotFound } from '../not-found';

describe('NotFound SSR status handling', () => {
    it('sets staticContext.status to 404 for unmatched routes', () => {
        const context: { status?: number; url?: string } = { status: 200 };
        const html = renderToString(
            <StaticRouter context={context} location="/nonexistent-route-check">
                <Switch>
                    <Route exact path="/" render={() => <div>Home</div>} />
                    <Route component={NotFound} />
                </Switch>
            </StaticRouter>
        );

        expect(context.status).toBe(404);
        expect(html).toContain('Page not found');
    });
});
