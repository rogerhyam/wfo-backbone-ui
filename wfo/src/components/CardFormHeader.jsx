import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

class CardFormHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    getCardHeader = () => {

        const { name, taxon, synOf } = this.props;

        // at initialisation everything may be null
        if (!name && !taxon && !synOf) {
            return "";
        }

        // if there is no name then this is an unspecified taxon
        if (!name) {
            return (<Card.Header>Unspecified {taxon.rank.name}</Card.Header>);
        }

        // if there is a taxon then we are displaying an accepted part of the hierarchy
        if (taxon) {
            let displayRank = taxon.rank.name.charAt(0).toUpperCase() + taxon.rank.name.slice(1);
            return (<Card.Header>{displayRank}</Card.Header>);
        }

        // if there is a synOf then we are a synonym
        if (synOf) {
            return (<Card.Header>Synonymous Name</Card.Header>);
        }

        // got to here so we have a name but no placement in the taxonomy
        if (name.status == 'deprecated') {
            return (<Card.Header>Deprecated Name</Card.Header>);
        }

        return (<Card.Header>Unplaced Name</Card.Header>);

    }

    getHeadline = () => {

        const { name, taxon, synOf } = this.props;

        if (name) {
            return (<span dangerouslySetInnerHTML={{ __html: name.fullNameString }} />);
        }

        return "No Name";

    }

    render() {

        const { taxon, name } = this.props;
        return (
            <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
                {this.getCardHeader()}

                <Card.Body>
                    <h2>{this.getHeadline()}</h2>
                </Card.Body>
            </Card>
        );
    }
}
export default CardFormHeader;