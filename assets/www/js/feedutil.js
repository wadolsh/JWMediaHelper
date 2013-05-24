// http://davidwalsh.name/convert-xml-json 에나오는 소스를 개량(개량했는지 기억이 가물가물)
// http://davidwalsh.name/convert-xml-json にあるソースを少し改造
// Changes XML to JSON
function xml2Obj (oXMLNode) {
    // default value for empty elements; it could be replaced with "null" instead of "true"... but i prefer so, because the truth is what appears :-)
    var vResult = true;
    // node attributes
    if (oXMLNode.attributes && oXMLNode.attributes.length > 0) {
        var iAttrib;
        vResult = {};
        vResult["@attributes"] = {};
        for (var iAttrId = 0; iAttrId < oXMLNode.attributes.length; iAttrId++) {
            iAttrib = oXMLNode.attributes.item(iAttrId);
            vResult["@attributes"][iAttrib.nodeName] = iAttrib.nodeValue;
        }
    }
    // children
    if (oXMLNode.hasChildNodes()) {
        var iKey, iValue, iXMLChild;
        if (vResult === true) { vResult = {}; } // if above you have changed the default value, then it must be also replaced within this "if statement" in the same way...
        for (var iChild = 0; iChild < oXMLNode.childNodes.length; iChild++) {
            iXMLChild = oXMLNode.childNodes.item(iChild);
            if ((iXMLChild.nodeType & 7) === 1) { // nodeType is "Document" (9) or "Element" (1)
                iKey = iXMLChild.nodeName;
                iValue = xml2Obj(iXMLChild);
                if (vResult.hasOwnProperty(iKey)) {
                    if (vResult[iKey].constructor !== Array) { vResult[iKey] = [vResult[iKey]]; }
                    vResult[iKey].push(iValue);
                } else { vResult[iKey] = iValue; }
            } else if ((iXMLChild.nodeType - 1 | 1) === 3) { // nodeType is "Text" (3) or "CDATASection" (4)
                iKey = "@content";
                iValue = iXMLChild.nodeType === 3 ? iXMLChild.nodeValue.replace(/^\s+|\s+$/g, "") : iXMLChild.nodeValue;
                if (vResult.hasOwnProperty(iKey)) {
                    vResult[iKey] += iValue;
                } else if (iXMLChild.nodeType === 4 || iValue !== "") {
                    vResult = iValue;
                }
            }
        }
    }
    return(vResult);
}