const { Router } = require("express");
const { Videogame, Genre } = require("../db");
const axios = require("axios");
const { APIKEY } = process.env;

const router = Router();

//api
const infoDeApi = async () => {
  try {
    let results = [];
    const queries = [];
    const pages = [1, 2, 3, 4, 5];

    pages.forEach((page) => {
      queries.push(
        axios.get(`https://api.rawg.io/api/games?key=${APIKEY}&page=${page}`)
      );
    });
    await Promise.all(queries)
      .then((queryResults) => {
        queryResults.forEach((queryResult) => {
          let response = queryResult.data;
          results.push(
            ...response.results.map((e) => ({
              id: e.id,
              name: e.name.toLowerCase(),
              image: e.background_image,
              genres: e.genres.map((g) => g.name),
              rating: e.rating,
              platforms: e.parent_platforms.map((p) => p.platform.name),
            }))
          );
        });
      })
      .then(() => results)
      .catch((error) => console.log(error));
    return results;
  } catch (error) {
    console.log(error, "no tengo api");
  }
};

const infoDeDb = async () => {
  try {
    const baseVide = await Videogame.findAll({
        include: {
        model: Genre,
        attributes: ["id", "name"],
              through: {
                attributes: [],
        },
      },
    });

    const vidComple = [];
    if (baseVide.length > 0) {
      for (var i = 0; i < baseVide.length; i++) {
        let bdVide = baseVide[i];
       
        let dbDetail = {
          id: bdVide.id,
          name: bdVide.name.toLowerCase(),
          description: bdVide.description,
          rating: bdVide.rating,
          platforms: bdVide.platforms,
          genres: bdVide.Genres.map((g) => g.name),
          image: bdVide.image,
          createInDb: bdVide.createInDb,
          released: bdVide.released,
        };
        vidComple.push(dbDetail);
      }
      return vidComple;
      
    }
  } catch (err) {
    console.log(err);
  }
};

const infoAca = async () => {
  const deapi = await infoDeApi();
  const infodb2 = await infoDeDb();
  const sumaInfo = deapi.concat(infodb2);
  return sumaInfo;
};

//NAME
router.get("/", async (req, res) => {
  const name = req.query.name;

  try {
    const videName = await infoAca();
    if (name) {
      const nameVideogame = videName.filter((v) =>
        v.name.toLowerCase().includes(name.toLowerCase())
      );
      if (!nameVideogame.length) {
        return res.status(404).send([{ info: "I cannot find it" }]);
      }
      return res.send(nameVideogame);
    }
    res.json(videName);
  } catch (error) {
    console.log(error, "falla el nombre");
  }
});

//id
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (isNaN(id)) {
      let videogame = await Videogame.findByPk(id, {
        include: Genre,
      }).then((resp) => {
        return {
          id: resp.id,
          name: resp.name.toLowerCase(),
          description: resp.description,
          rating: parseInt(resp.rating),
          platforms: resp.platforms,
          genres: resp.Genres.map((g) => {
            return g.name;
          }),
          image: resp.image,
          released: resp.released,
        };
      });
      console.log(videogame, 'el segundo')
      res.send(videogame);
    } else {
      let videogame = await axios(
        `https://api.rawg.io/api/games/${id}?key=${APIKEY}`
      ).then((resp) => {
        let platforms = resp.data.platforms.map((p) => {
          return p.platform.name;
        });
        let genres = resp.data.genres.map((g) => {
          return g.name;
        });

        return {
          id: resp.data.id,
          name: resp.data.name.toLowerCase(),
          description: resp.data.description_raw,
          rating: resp.data.rating,
          platforms,
          genres,
          image: resp.data.background_image,
          released: resp.data.released,
        };
      });
      res.send(videogame);
    }
  } catch (error) {
    next(error);
  }
});

//post
router.post("/", async (req, res) => {
  const { name, description, rating, platforms, released, genres, image } =
    req.body;

  try {
    const videCreate = await Videogame.create({
      name: name,
      description,
      rating,
      platforms,
      released,
      image,
    });
    genres.forEach(async function (v) {
      var genBd = await Genre.findOne({
        where: {
          name: v,
        },
      });
      videCreate.setGenres(genBd);
    });
    return res.json(videCreate);
  } catch (error) {
    console.log(error, "no puedo crear");
  }
});



module.exports = router;



