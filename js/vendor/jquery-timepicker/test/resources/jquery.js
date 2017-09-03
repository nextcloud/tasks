(function() {

    var parts = document.location.search.slice( 1 ).split( "&" ),
        length = parts.length,
        file = "http://code.jquery.com/jquery-git.js",
        version = "2.1.1",
        current,
        i = 0;

    for ( ; i < length; i++ ) {
        current = parts[ i ].split( "=" );
        if ( current[ 0 ] === "jquery" ) {
            version = current[ 1 ];
            break;
        }
    }

    if (version != "git") {
        file = "resources/jquery/jquery-" + version + ".min.js";
    }

    document.write( "<script src='" + file + "'></script>" );

})();
