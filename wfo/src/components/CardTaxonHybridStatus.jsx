import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const HYBRID_QUERY = gql`
   query getHybridStatus($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            wfo,
            taxonPlacement{
                id,
                isHybrid,
                acceptedName{
                    id,
                    wfo
                }
            }
        }
    }
`;

const UPDATE_HYBRID = gql`
        mutation  updateHybridStatus(
            $id: Int!,
            $isHybrid: Boolean!
            ){
          updateHybridStatus(
              id: $id,
              isHybrid: $isHybrid
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

function CardTaxonHybridStatus(props) {

    const [isHybrid, setHybridStatus] = useState(false);
    const [wfo, setWfo] = useState('');

    const { data } = useQuery(HYBRID_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateHybridStatus, { loading: updateLoading }] = useMutation(UPDATE_HYBRID, {
        refetchQueries: [
            'getHeaderInfo',
            'getChildren'
        ],
        update(cache) {
            cache.modify({
                id: cache.identify(name.taxonPlacement),
                fields: {
                    isHybrid(cachedVal) {
                        // just toggle it
                        return !cachedVal;
                    }
                }
            });
        }
    });


    let name = data ? data.getNameForWfoId : null;

    // if we don't have a name then don't render at all
    if (!name) return null;

    // can we edit?
    if (!name.canEdit) return null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
    }


    if (name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id) {
        // we are this taxon so it is appropriate
        if (isHybrid !== name.taxonPlacement.isHybrid) setHybridStatus(name.taxonPlacement.isHybrid);
    } else {
        // not an accepted name so don't display
        return null;
    }



    function handleStatusChange(e) {
        setHybridStatus(e.target.checked);
        updateHybridStatus({
            variables: {
                id: parseInt(name.taxonPlacement.id),
                isHybrid: e.target.checked
            }
        });
    }

    let label = null;
    if (updateLoading) {
        label = " Updating... ";
    } else {
        label = isHybrid ? "Uncheck the box to make this a regular taxon." : "Check the box to make this a hybrid taxon.";
    }

    return (
        <Form >
            <Card bg="warning" text="dark" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    <OverlayTrigger
                        key="hybrid-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-hybrid`}>
                                A flag to indicate that this taxon is of hybrid origin.
                            </Tooltip>
                        }
                    >
                    <span>Hybrid Status</span>
                    </OverlayTrigger>                
                    
                </Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "black" }} >

                        <Form.Group controlId="hybrid">
                            <Form.Check
                                type="checkbox"
                                id="hybrid"
                                label={label}
                                onChange={handleStatusChange}
                                checked={isHybrid}
                            />
                        </Form.Group>   
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardTaxonHybridStatus;
