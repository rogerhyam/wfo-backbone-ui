import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AlertUpdate from "./AlertUpdate";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardNameAuthorsModal from "./CardNameAuthorsModal";

const AUTHORS_QUERY = gql`
   query getNameAuthors($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            authorsString
        }
    }
`;

const UPDATE_AUTHORS = gql`
        mutation  updateAuthorsString(
            $wfo: String!,
            $authorsString: String!
            ){
          updateAuthorsString(
              wfo: $wfo,
              authorsString: $authorsString
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            }
          }
        }
`;

function CardNameAuthors(props) {

    const [authorsString, setAuthorsString] = useState('');
    const [wfo, setWfo] = useState('');

    const { loading, data } = useQuery(AUTHORS_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateAuthorsString, { loading: mLoading, data: mData }] = useMutation(UPDATE_AUTHORS, {
        refetchQueries: [
            AUTHORS_QUERY, // run this query again
            'getNameAuthors',
            'getHeaderInfo',
            'getNameForIpniDifferences' // Query name
        ],
    });

    let name = data ? data.getNameForWfoId : null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
        setAuthorsString(name.authorsString === null ? '' : name.authorsString);
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateAuthorsString(
            {
                variables: {
                    wfo: props.wfo,
                    authorsString: authorsString
                }
            }
        );
    }

    function handleAuthorsChange(event) {
        event.preventDefault();
        setAuthorsString(event.target.value);
    }

    function renderButton() {

        // nothing to save don't render at all
        if (name) {
            if (name.authorsString === authorsString) return null;
            if (name.authorsString === null && authorsString === "") return null;
        }

        // should we be disabled
        let spinner = null;

        if (loading) {
            spinner = <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
        }

        return (
            <Form.Group controlId="submit-button" style={{ textAlign: "right", marginTop: "1em" }}>
                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    Update
                    {" "}
                    {spinner}
                </Button>
            </Form.Group>
        );


    }

    /*

        Block for adding button for validator - work to come soon...



                            <Form.Group as={Col} controlId="authors">
                        <Form.Control type="text" disabled={name && name.canEdit ? false : true} placeholder="Abbreviated author names" name="authorsString" value={authorsString} onChange={handleAuthorsChange} />
                    </Form.Group>

    */

    return (
        <Form onSubmit={handleSubmit}>
            <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    <OverlayTrigger
                        key="status-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-status`}>
                                The names of the authors using standardized abbreviations where possible.
                            </Tooltip>
                        }
                    >
                    <span>Author String</span>
                    </OverlayTrigger>
                </Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                    <Row>
                        <Form.Group as={Col} controlId="authors">
                            <Form.Control type="text" disabled={name && name.canEdit ? false : true} placeholder="Abbreviated author names" name="authorsString" value={authorsString} onChange={handleAuthorsChange} />
                        </Form.Group>
                        <Form.Group as={Col} md="auto" controlId="authorsValidate">
                            <CardNameAuthorsModal authorsString={authorsString} wfo={wfo}/>
                        </Form.Group>
                    </Row>
                    <AlertUpdate response={mData ? mData.updateAuthorsString : null} loading={mLoading} wfo={props.wfo} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardNameAuthors;
