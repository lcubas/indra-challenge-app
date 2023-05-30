import { v4 as uuidv4 } from "uuid";
import { APIGatewayEvent, Context } from "aws-lambda";
import { Planet } from "../model/planet";
import { DBConnector } from "../model/DBConnector";
import { PlanetValidator } from "../validators/PlanetValidator";
import { CreatePlanetService } from "../service/createPlanetService";
import { Body } from "../utils/interfaces/Body";
import { BodyError } from "../utils/interfaces/BodyError";
import { BodySuccess } from "../utils/interfaces/BodySuccess";
import { ResponseUtil } from "../response/ResponseUtil";
import { Response } from "../utils/interfaces/Response";

export class CreatePlanetController extends CreatePlanetService {
  constructor(dbConnector: DBConnector) {
    super(dbConnector);
  }

  create = async (
    event: APIGatewayEvent,
    _: Context
  ): Promise<Response> => {
    const params: Planet = JSON.parse(event.body);
    const validator = new PlanetValidator();

    const validations = validator.validate(params);
    if (Object.keys(validations).length > 0) {
      const body: Body = { message: JSON.stringify(validations) };
      return ResponseUtil.clientErrorBadRequest(body);
    }

    try {
      //set id to planet
      params.id = uuidv4();
      const newPlanet = await this.createPlanet(params);
      const body: BodySuccess = {
        message: "Planeta creado exitosamente.",
        data: newPlanet,
      };

      if (newPlanet === null) {
        body.message =
          "Se recibió la petición, pero vuelva a intertalo más tarde.";
        return ResponseUtil.successfulResponseNoContent(body);
      }

      return ResponseUtil.successfulResponseCreated(body);
    } catch (e) {
      const body: BodyError = {
        message: "No se pudo crear el nuevo planeta",
        errorMessage: e.message,
        errorStack: e.errorStack,
      };

      return ResponseUtil.serverErrorBadRequest(body);
    }
  }
}
