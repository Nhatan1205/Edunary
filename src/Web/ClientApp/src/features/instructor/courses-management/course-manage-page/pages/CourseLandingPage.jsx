c
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "brand.main",
                          borderWidth: "3px",
                        },
                      },
                    }}
                  >
                    <InputLabel>Level</InputLabel>
                    <Select {...field} label="Level">
                      <MenuItem value="">-- Select Level --</MenuItem>
                      <MenuItem value={0}>Beginner</MenuItem>
                      <MenuItem value={1}>Intermediate</MenuItem>
                      <MenuItem value={2}>Advanced</MenuItem>
                      <MenuItem value={3}>All Levels</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Col>
          <Col md={6}>
            <Box sx={{ mb: 3 }}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    sx={{
                      "& label.Mui-focused": {
                        color: "brand.dark",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "brand.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "brand.main",
                          borderWidth: "3px",
                        },
                      },
                    }}
                  >
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categoryData?.items?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Col>
        </Row>
        {/* Primary Taught */}
        <Box sx={{ mb: 3 }}>
          <TextField
            {...register("topic")}
            fullWidth
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                What is primarily taught in your course?
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            }
            placeholder="e.g. Landscape Photography"
            sx={{
              "& label.Mui-focused": {
                color: "brand.dark",
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "brand.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "brand.main",
                  borderWidth: "3px",
                },
              },
            }}
          />
        </Box>
        {/* Course Image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Course image
          </Typography>
          <Row>
            <Col md={5}>
              <Paper
                variant="outlined"
                sx={{
                  minHeight: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.50",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    textAlign: "center",
                    objectFit: "cover",
                    height: 200,
                    width: "100%",
                  }}
                  src={courseData.imageUrl || defaultImage}
                />
              </Paper>
            </Col>
            <Col md={7}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Upload your course image here. It must meet our course image
                quality standards to be accepted. Important guidelines: 750x422
                pixels; .jpg, .jpeg, .gif, or .png. no text on the image.
              </Typography>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                id="upload-image"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {/* Button to open file explorer */}
              <Button
                variant="outline"
                component="label"
                htmlFor="upload-image"
                fullWidth
                sx={{
                  borderColor: "brand.main",
                  border: "1px solid",
                  color: "brand.main",
                  backgroundColor: "background.default",
                  "&:hover": {
                    borderColor: "brand.dark",
                    color: "brand.dark",
                  },
                }}
                disabled={IsCourseImageLoading}
              >
                Choose Image
              </Button>
              {IsCourseImageLoading && (
                <div className="d-flex justify-content-center mt-2">
                  <LoadingSpinner />
                </div>
              )}
            </Col>
          </Row>
        </Box>

        <Box sx={{ mt: 10 }}>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            sx={{
              bgcolor: "brand.main",
              "&:hover": {
                backgroundColor: "brand.dark",
              },
            }}
            disabled={
              IsCourseImageLoading ||
              isCourseDataLoading ||
              isCategoryDataLoading
            }
          >
            Save
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CourseLandingPage;
c