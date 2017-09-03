(function() {

    var parts = document.location.search.slice( 1 ).split( "&" ),
        length = parts.length,
        version = "1.11.1",
        current,
        i = 0;

    for ( ; i < length; i++ ) {
        current = parts[ i ].split( "=" );
        if ( current[ 0 ] === "jquery-ui" && current[ 1 ].length > 0 ) {
            version = current[ 1 ];
            break;
        }
    }

    if ( version.substr( 0, 3 ) == '1.8' ) {
        css = "resources/jquery-ui/jquery-ui-" + version + "/jquery-ui-" + version + ".custom.css";
        js = "resources/jquery-ui/jquery-ui-" + version + "/jquery-ui-" + version + ".custom.min.js";
    } else if ( version.substr( 0, 3 ) == '1.9' || version.substr( 0, 4 ) == '1.10' ) {
        css = "resources/jquery-ui/jquery-ui-" + version + "/css/ui-lightness/jquery-ui-" + version + ".custom.min.css";
        js = "resources/jquery-ui/jquery-ui-" + version + "/js/jquery-ui-" + version + ".custom.min.js";
    } else if ( version.substr( 0, 4 ) == '1.11' ) {
        css = "resources/jquery-ui/jquery-ui-" + version + "/jquery-ui.min.css";
        js = "resources/jquery-ui/jquery-ui-" + version + "/jquery-ui.min.js";
    }

    document.write( "<link rel='stylesheet' href='" + css + "' type='text/css' />" );
    document.write( "<script src='" + js + "'></script>" );

})();
