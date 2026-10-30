import React from 'react';
import { Route, Switch } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { DisplayPreferencesProvider } from './displayPreferences-context';
import { Header } from './components';
import { MapApp } from './map-app';
import { Building, UserVerified } from './models/building';
import { User } from './models/user';
import {
    ChangesPage,
    ContactPage,
    DataAccuracyPage,
    DataExtracts,
    LeaderboardPage,
    OrdnanceSurveyLicencePage,
    PrivacyPolicyPage,
    NotFound
} from './features/pages';
import {
    AuthRoute,
    PrivateRoute,
    AuthProvider,
    ForgottenPassword,
    Login,
    MyAccountPage,
    PasswordReset,
    SignUp
} from './features/auth';


interface AppProps {
    user?: User;
    building?: Building;
    user_verified?: UserVerified;
    revisionId: string;
}

/**
 * App component
 *
 * This is the top-level stateful frontend component
 * - rendered from props, instantiated either server-side in server.js or client-side in
 *   client.js
 * - state (including user, current building) is initialised from props
 * - callbacks to update top-level state are passed down to subcomponents
 * - render method wraps a react-router switch - this drives which version of the sidebar and
 *   map or other pages are rendered, based on the URL. Use a react-router-dom <Link /> in
 *   child components to navigate without a full page reload.
 */

export const App: React.FC<AppProps> = props => {
    const mapAppPaths = ['/', '/:mode(view|edit|multi-edit)/:category/:building(\\d+)?/(history)?'];

    return (
        <DisplayPreferencesProvider>
            <AuthProvider preloadedUser={props.user}>
                <Header animateLogo={false} />
                <Switch>
                    <AuthRoute exact path="/login.html" component={Login} />
                    <AuthRoute exact path="/forgotten-password.html" component={ForgottenPassword} />
                    <AuthRoute exact path="/password-reset.html" component={PasswordReset} />
                    <AuthRoute exact path="/sign-up.html" component={SignUp} />
                    <PrivateRoute exact path="/my-account.html" component={MyAccountPage} />
                    <Route exact path="/privacy-policy.html" component={PrivacyPolicyPage} />
                    <Route exact path="/ordnance-survey-licence.html" component={OrdnanceSurveyLicencePage} />
                    <Route exact path="/data-accuracy.html" component={DataAccuracyPage} />
                    <Route exact path="/data-extracts.html" component={DataExtracts} />
                    <Route exact path="/contact.html" component={ContactPage} />
                    <Route exact path="/leaderboard.html" component={LeaderboardPage} />
                    <Route exact path="/history.html" component={ChangesPage} />
                    <Route exact path={mapAppPaths} >
                        <MapApp
                            building={props.building}
                            user_verified={props.user_verified}
                            revisionId={props.revisionId}
                        />
                    </Route>
                    <Route component={NotFound} />
                </Switch>
            </AuthProvider>
        </DisplayPreferencesProvider>
    );
};
