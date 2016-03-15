exports.downloadRDF = function(req, res) {     
        
    res.set({
        "Content-Disposition": 'attachment; filename="'+'output.rdf'+'"',
        "Content-Type": "text/plain"    
    });
        res.sendFile(require('path').join(__dirname, '/../../', 'output.rdf'));
        
}