import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

const Landing = ({ auth: { isAuthenticated, loading }}) => {
    console.log(isAuthenticated);
    const authLinks = (
        <div className="buttons">
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
            <Link to="/login" className="btn btn-light">Login</Link>
        </div>
    );

    return (
        <section className="landing">
            <div className="dark-overlay">
                <div className="landing-inner">
                    <h1 className="x-large">Developer Connector</h1>
                    <p className="lead">
                        Create a developer profile/portfolio, share posts and get help from
                        other developers
                    </p>
                    { !loading && (<Fragment>{ !isAuthenticated && authLinks }</Fragment>)}
                </div>
            </div>
        </section>
    );
};

const mapStateToProps = state => ({
    auth: state.auth
})


export default connect(mapStateToProps)(Landing);
